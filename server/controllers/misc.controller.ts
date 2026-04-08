import { Request, Response } from 'express';
import { dbService } from '../services/db.service.js';
import { OtpService } from '../services/otp.service.js';
import { catchAsync, AppError } from '../middleware/error.js';
import { logAudit } from '../services/audit.service.js';

export const getConfig = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();

  // Public/system fallback
  if (!req.user) {
    return res.json(db.systemConfig || {});
  }

  if (req.user.role === 'super_admin') {
    return res.json(db.systemConfig || {});
  }

  const org = db.organizations.find((o: any) => o.id === req.user.orgId);
  if (!org) throw new AppError('Organization not found', 404);

  return res.json({
    id: org.id,
    name: org.name,
    slug: org.slug,
    ...(org.config || { customAttributeDefinitions: [] }),
  });
});

export const getOrgBySlug = catchAsync(async (req: Request, res: Response) => {
  const db = dbService.get();
  const org = db.organizations.find((o: any) => o.slug === req.params.slug);
  if (!org) throw new AppError('Organization not found', 404);
  res.json(org);
});

export const getPublicOrgs = catchAsync(async (_req: Request, res: Response) => {
  const db = dbService.get();
  const orgs = db.organizations.map((o: any) => ({
    id: o.id,
    name: o.name,
    slug: o.slug,
    description: o.description,
  }));
  res.json(orgs);
});

export const updateConfig = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();

  if (req.user.role === 'super_admin') {
    db.systemConfig = {
      ...(db.systemConfig || {}),
      ...req.body,
    };
    dbService.save(db);

    logAudit({
      actorUid: req.user.uid,
      actorRole: req.user.role,
      action: 'system.config.update',
      entityType: 'system_config',
      details: { fields: Object.keys(req.body || {}) },
    });

    return res.json({ success: true, config: db.systemConfig });
  }

  const orgIndex = db.organizations.findIndex((o: any) => o.id === req.user.orgId);
  if (orgIndex === -1) throw new AppError('Organization not found', 404);

  db.organizations[orgIndex].name = req.body.name ?? db.organizations[orgIndex].name;
  db.organizations[orgIndex].description = req.body.description ?? db.organizations[orgIndex].description;
  db.organizations[orgIndex].config = {
    ...(db.organizations[orgIndex].config || {}),
    customAttributeDefinitions: req.body.customAttributeDefinitions ?? db.organizations[orgIndex].config?.customAttributeDefinitions ?? [],
  };

  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: req.user.orgId,
    action: 'org.config.update',
    entityType: 'organization',
    entityId: req.user.orgId,
    details: { fields: Object.keys(req.body || {}) },
  });

  res.json({ success: true, config: db.organizations[orgIndex] });
});

const MOCK_FAYDA_REGISTRY: Record<string, string> = {
  '1234567890': 'Abebe Kebede',
  '0987654321': 'Sara Johnson',
  '1122334455': 'Tadesse Mengistu',
};

export const verifyFayda = catchAsync(async (req: Request, res: Response) => {
  const { faydaId } = req.body;
  if (!faydaId) throw new AppError('Fayda ID required', 400);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!/^\d{10}$/.test(faydaId)) {
    return res.json({ success: false, error: 'Identity ID must be exactly 10 digits' });
  }

  const fullName = MOCK_FAYDA_REGISTRY[faydaId];

  if (fullName) {
    res.json({
      success: true,
      data: {
        id: faydaId,
        fullName,
        verified: true,
        issuedBy: 'National ID Program',
        expiryDate: '2030-12-31',
      },
    });
  } else {
    res.json({ success: false, error: 'Identity not found in National Registry. Please visit a registration center.' });
  }
});

export const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber } = req.body;
  const otp = OtpService.send(phoneNumber);
  res.json({ success: true, _dev_otp: otp });
});

export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const { phoneNumber, otp } = req.body;
  const isValid = OtpService.verify(phoneNumber, otp);
  if (isValid) {
    res.json({ success: true });
  } else {
    throw new AppError('Invalid or expired OTP', 400);
  }
});
