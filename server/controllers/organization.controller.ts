import { Response } from 'express';
import { dbService } from '../services/db.service.js';
import { AppError, catchAsync } from '../middleware/error.js';
import crypto from 'crypto';
import { logAudit } from '../services/audit.service.js';

export const getOrganizations = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  res.json(db.organizations);
});

export const createOrganization = catchAsync(async (req: any, res: Response) => {
  const { name, slug, description } = req.body;
  const db = dbService.get();

  const newOrg = {
    id: `org-${crypto.randomBytes(4).toString('hex')}`,
    name,
    slug,
    description,
    status: 'active',
    createdAt: new Date().toISOString(),
    config: { customAttributeDefinitions: [] },
  };

  db.organizations.push(newOrg);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    action: 'organization.create',
    entityType: 'organization',
    entityId: newOrg.id,
    details: { slug: newOrg.slug },
  });

  res.status(201).json(newOrg);
});

export const updateOrganization = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.organizations.findIndex((o: any) => o.id === req.params.id);
  if (index === -1) throw new AppError('Organization not found', 404);

  db.organizations[index] = { ...db.organizations[index], ...req.body };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    action: 'organization.update',
    entityType: 'organization',
    entityId: db.organizations[index].id,
    details: { fields: Object.keys(req.body || {}) },
  });

  res.json(db.organizations[index]);
});

export const deleteOrganization = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  db.organizations = db.organizations.filter((o: any) => o.id !== req.params.id);
  db.users = db.users.filter((u: any) => u.orgId !== req.params.id);
  db.events = db.events.filter((e: any) => e.orgId !== req.params.id);
  db.blogs = db.blogs.filter((b: any) => b.orgId !== req.params.id);
  db.subscriptions = db.subscriptions.filter((s: any) => s.orgId !== req.params.id);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    action: 'organization.delete',
    entityType: 'organization',
    entityId: req.params.id,
  });

  res.json({ success: true });
});
