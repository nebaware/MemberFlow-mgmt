import { Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { dbService } from '../services/db.service.js';
import { AppError, catchAsync } from '../middleware/error.js';
import { logAudit } from '../services/audit.service.js';

const ensureOrgScope = (req: any, targetOrgId?: string) => {
  if (req.user.role === 'org_admin' && targetOrgId && targetOrgId !== req.user.orgId) {
    throw new AppError('Unauthorized access to member', 403);
  }
};

export const getMembers = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const members = db.users.filter((u: any) => {
    if (u.role !== 'member') return false;
    if (req.user.role === 'super_admin') return true;
    return u.orgId === req.user.orgId;
  });

  res.json(members.map(({ password: _, ...u }: any) => u));
});

export const createMember = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const { fullName, email, phoneNumber, status, orgId, role, customAttributes } = req.body;

  if (!fullName || !email) throw new AppError('fullName and email are required', 400);
  if (db.users.some((u: any) => u.email === email)) throw new AppError('Email already exists', 400);

  const targetOrgId = req.user.role === 'super_admin' ? orgId : req.user.orgId;
  if (!targetOrgId) throw new AppError('Organization is required', 400);
  ensureOrgScope(req, targetOrgId);

  const tempPassword = crypto.randomBytes(4).toString('hex');
  const newMember = {
    uid: crypto.randomUUID(),
    fullName,
    email,
    password: await bcrypt.hash(tempPassword, 10),
    phoneNumber: phoneNumber || '',
    orgId: targetOrgId,
    role: role || 'member',
    status: status || 'pending',
    createdAt: new Date().toISOString(),
    customAttributes: customAttributes || {},
    profilePhotoUrl: '',
    lastActiveAt: null,
  };

  db.users.push(newMember);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: targetOrgId,
    action: 'member.create',
    entityType: 'member',
    entityId: newMember.uid,
    details: { email: newMember.email, role: newMember.role },
  });

  const { password: _, ...safeMember } = newMember;
  res.status(201).json(safeMember);
});

export const updateMember = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.users.findIndex((u: any) => u.uid === req.params.uid && u.role === 'member');
  if (index === -1) throw new AppError('Member not found', 404);

  ensureOrgScope(req, db.users[index].orgId);

  const updates = { ...req.body };
  delete updates.password;
  delete updates.uid;

  db.users[index] = {
    ...db.users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: db.users[index].orgId,
    action: 'member.update',
    entityType: 'member',
    entityId: db.users[index].uid,
    details: { fields: Object.keys(updates) },
  });

  const { password: _, ...safeMember } = db.users[index];
  res.json({ success: true, member: safeMember });
});

export const bulkMemberAction = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const { uids, action, status } = req.body;
  if (!Array.isArray(uids) || uids.length === 0) throw new AppError('uids must be a non-empty array', 400);

  let affected = 0;
  for (const uid of uids) {
    const idx = db.users.findIndex((u: any) => u.uid === uid && u.role === 'member');
    if (idx === -1) continue;
    ensureOrgScope(req, db.users[idx].orgId);

    if (action === 'delete') {
      db.users.splice(idx, 1);
      affected += 1;
      continue;
    }

    if (action === 'status' && status) {
      db.users[idx].status = status;
      db.users[idx].updatedAt = new Date().toISOString();
      affected += 1;
      continue;
    }
  }

  dbService.save(db);
  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: req.user.orgId,
    action: 'member.bulk_action',
    entityType: 'member',
    details: { action, status, requestedCount: uids.length, affected },
  });

  res.json({ success: true, affected });
});

export const importMembers = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const payload = req.body?.members;
  if (!Array.isArray(payload)) throw new AppError('members array is required', 400);

  let imported = 0;
  for (const item of payload) {
    if (!item?.email || !item?.fullName) continue;
    if (db.users.some((u: any) => u.email === item.email)) continue;

    const targetOrgId = req.user.role === 'super_admin' ? (item.orgId || req.user.orgId) : req.user.orgId;
    if (!targetOrgId) continue;

    db.users.push({
      uid: crypto.randomUUID(),
      fullName: item.fullName,
      email: item.email,
      password: await bcrypt.hash(crypto.randomBytes(4).toString('hex'), 10),
      phoneNumber: item.phoneNumber || '',
      orgId: targetOrgId,
      role: 'member',
      status: item.status || 'pending',
      createdAt: new Date().toISOString(),
      customAttributes: item.customAttributes || {},
      profilePhotoUrl: '',
      lastActiveAt: null,
    });
    imported += 1;
  }

  dbService.save(db);
  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: req.user.orgId,
    action: 'member.import',
    entityType: 'member',
    details: { imported, attempted: payload.length },
  });

  res.json({ success: true, imported, attempted: payload.length });
});

export const exportMembers = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const members = db.users.filter((u: any) => {
    if (u.role !== 'member') return false;
    if (req.user.role === 'super_admin') return true;
    return u.orgId === req.user.orgId;
  });

  const safeMembers = members.map(({ password: _, ...m }: any) => m);
  res.json({ success: true, total: safeMembers.length, members: safeMembers });
});

export const deleteMember = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.users.findIndex((u: any) => u.uid === req.params.uid && u.role === 'member');
  if (index === -1) throw new AppError('Member not found', 404);

  ensureOrgScope(req, db.users[index].orgId);

  const target = db.users[index];
  db.users.splice(index, 1);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: target.orgId,
    action: 'member.delete',
    entityType: 'member',
    entityId: target.uid,
    details: { email: target.email },
  });

  res.json({ success: true });
});
