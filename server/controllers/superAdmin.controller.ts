import { Response } from 'express';
import { dbService } from '../services/db.service.js';
import { AppError, catchAsync } from '../middleware/error.js';
import { logAudit } from '../services/audit.service.js';

export const listOrganizations = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  res.json(db.organizations);
});

export const createOrganization = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const { name, slug, description } = req.body;
  if (!name || !slug) throw new AppError('name and slug are required', 400);
  if (db.organizations.some((o: any) => o.slug === slug)) throw new AppError('slug already exists', 400);

  const newOrg = {
    id: `org-${Date.now().toString(16)}`,
    name,
    slug,
    description: description || '',
    status: 'active',
    createdAt: new Date().toISOString(),
    config: { customAttributeDefinitions: [] },
  };
  db.organizations.push(newOrg);
  dbService.save(db);
  logAudit({ actorUid: req.user.uid, actorRole: req.user.role, action: 'super_admin.org.create', entityType: 'organization', entityId: newOrg.id });
  res.status(201).json(newOrg);
});

export const updateOrganization = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const idx = db.organizations.findIndex((o: any) => o.id === req.params.id);
  if (idx === -1) throw new AppError('Organization not found', 404);
  db.organizations[idx] = { ...db.organizations[idx], ...req.body };
  dbService.save(db);
  logAudit({ actorUid: req.user.uid, actorRole: req.user.role, action: 'super_admin.org.update', entityType: 'organization', entityId: db.organizations[idx].id, details: { fields: Object.keys(req.body || {}) } });
  res.json(db.organizations[idx]);
});

export const suspendOrganization = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const idx = db.organizations.findIndex((o: any) => o.id === req.params.id);
  if (idx === -1) throw new AppError('Organization not found', 404);
  db.organizations[idx].status = 'suspended';
  dbService.save(db);
  logAudit({ actorUid: req.user.uid, actorRole: req.user.role, action: 'super_admin.org.suspend', entityType: 'organization', entityId: db.organizations[idx].id });
  res.json({ success: true, organization: db.organizations[idx] });
});

export const listOrgAdmins = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  const admins = db.users
    .filter((u: any) => u.role === 'org_admin')
    .map((u: any) => {
      const org = db.organizations.find((o: any) => o.id === u.orgId);
      const { password: _p, ...safe } = u;
      return { ...safe, orgName: org?.name || 'Unknown' };
    });
  res.json(admins);
});

export const listMembers = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  const members = db.users
    .filter((u: any) => u.role === 'member')
    .map((u: any) => {
      const org = db.organizations.find((o: any) => o.id === u.orgId);
      const { password: _p, ...safe } = u;
      return { ...safe, orgName: org?.name || 'Unknown' };
    });
  res.json(members);
});

export const listPayments = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  const payments = db.payments.map((p: any) => {
    const member = db.users.find((u: any) => u.uid === p.memberId);
    const org = db.organizations.find((o: any) => o.id === (p.orgId || member?.orgId));
    return {
      ...p,
      memberEmail: member?.email || '',
      orgName: org?.name || 'Unknown',
    };
  });
  res.json(payments);
});

export const getSystemConfig = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  res.json(db.systemConfig || {});
});

export const patchSystemConfig = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  db.systemConfig = { ...(db.systemConfig || {}), ...(req.body || {}) };
  dbService.save(db);
  logAudit({ actorUid: req.user.uid, actorRole: req.user.role, action: 'super_admin.system_config.update', entityType: 'system_config', details: { fields: Object.keys(req.body || {}) } });
  res.json({ success: true, config: db.systemConfig });
});
