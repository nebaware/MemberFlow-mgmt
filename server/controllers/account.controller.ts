import { Request, Response } from 'express';
import { dbService } from '../services/db.service.js';
import { AppError, catchAsync } from '../middleware/error.js';
import { logAudit } from '../services/audit.service.js';

export const getProfile = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const user = db.users.find((u: any) => u.uid === req.user.uid);
  if (!user) throw new AppError('User not found', 404);

  const { password: _p, ...safe } = user;
  res.json({ success: true, profile: safe });
});

export const patchProfile = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const idx = db.users.findIndex((u: any) => u.uid === req.user.uid);
  if (idx === -1) throw new AppError('User not found', 404);

  const updates = { ...(req.body || {}) };
  delete updates.password;
  delete updates.role;
  delete updates.orgId;
  delete updates.uid;

  db.users[idx] = {
    ...db.users[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: db.users[idx].orgId,
    action: 'account.profile.update',
    entityType: 'user',
    entityId: req.user.uid,
    details: { fields: Object.keys(updates) },
  });

  const { password: _p, ...safe } = db.users[idx];
  res.json({ success: true, profile: safe });
});

export const patchOrganizationProfile = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  if (req.user.role !== 'org_admin') throw new AppError('Admin privileges required', 403);
  const orgIdx = db.organizations.findIndex((o: any) => o.id === req.user.orgId);
  if (orgIdx === -1) throw new AppError('Organization not found', 404);

  const org = db.organizations[orgIdx];
  db.organizations[orgIdx] = {
    ...org,
    name: req.body?.name ?? org.name,
    description: req.body?.description ?? org.description,
    config: {
      ...(org.config || {}),
      customAttributeDefinitions: req.body?.customAttributeDefinitions ?? org.config?.customAttributeDefinitions ?? [],
    },
  };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: req.user.orgId,
    action: 'account.organization.update',
    entityType: 'organization',
    entityId: req.user.orgId,
    details: { fields: Object.keys(req.body || {}) },
  });

  res.json({ success: true, organization: db.organizations[orgIdx] });
});

export const getAudit = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const logs = (db.auditLogs || []).filter((l: any) => l.actorUid === req.user.uid).slice(0, 200);
  res.json({ success: true, logs });
});
