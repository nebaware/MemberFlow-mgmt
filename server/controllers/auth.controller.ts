import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbService } from '../services/db.service.js';
import { config } from '../config/config.js';
import { AppError, catchAsync } from '../middleware/error.js';
import { logAudit } from '../services/audit.service.js';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { fullName, email, password, phoneNumber, faydaId, customAttributes, orgId } = req.body;
  const db = dbService.get();

  if (db.users.find((u: any) => u.email === email)) {
    throw new AppError('Email already registered', 400);
  }

  if (orgId && !db.organizations.find((o: any) => o.id === orgId)) {
    throw new AppError('Organization not found', 404);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    uid: crypto.randomUUID(),
    fullName,
    email,
    password: hashedPassword,
    phoneNumber,
    faydaId,
    orgId: orgId || null,
    role: orgId ? 'member' : 'super_admin',
    status: 'pending',
    createdAt: new Date().toISOString(),
    customAttributes: customAttributes || {},
    profilePhotoUrl: '',
  };

  db.users.push(newUser);
  dbService.save(db);

  const token = jwt.sign(
    { uid: newUser.uid, email: newUser.email, role: newUser.role, orgId: newUser.orgId },
    config.JWT_SECRET
  );

  logAudit({
    actorUid: newUser.uid,
    actorRole: newUser.role,
    orgId: newUser.orgId,
    action: 'auth.register',
    entityType: 'user',
    entityId: newUser.uid,
    details: { role: newUser.role },
  });

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, token, user: userWithoutPassword });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = dbService.get();

  const user = db.users.find((u: any) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign(
    { uid: user.uid, email: user.email, role: user.role, orgId: user.orgId },
    config.JWT_SECRET
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, token, user: userWithoutPassword });
});

export const getMe = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const user = db.users.find((u: any) => u.uid === req.user.uid);
  if (!user) throw new AppError('User not found', 404);

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

export const changePassword = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const user = db.users.find((u: any) => u.uid === req.user.uid);
  if (!user) throw new AppError('User not found', 404);

  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new AppError('currentPassword and newPassword are required', 400);

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw new AppError('Current password is incorrect', 400);

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordChangedAt = new Date().toISOString();
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: user.orgId,
    action: 'auth.password.change',
    entityType: 'user',
    entityId: req.user.uid,
  });

  res.json({ success: true });
});

export const updateProfilePhoto = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const user = db.users.find((u: any) => u.uid === req.user.uid);
  if (!user) throw new AppError('User not found', 404);

  const { profilePhotoUrl } = req.body;
  user.profilePhotoUrl = profilePhotoUrl || '';
  user.updatedAt = new Date().toISOString();
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: user.orgId,
    action: 'profile.photo.update',
    entityType: 'user',
    entityId: req.user.uid,
  });

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});
