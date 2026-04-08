import { Request, Response } from 'express';
import crypto from 'crypto';
import { dbService } from '../services/db.service.js';
import { PaymentService } from '../services/payment.service.js';
import { AppError, catchAsync } from '../middleware/error.js';
import { logAudit } from '../services/audit.service.js';

const canViewPayment = (payment: any, req: any, db: any) => {
  if (req.user.role === 'super_admin') return true;
  const member = db.users.find((u: any) => u.uid === payment.memberId);
  if (req.user.role === 'org_admin') return member?.orgId === req.user.orgId;
  return payment.memberId === req.user.uid;
};

export const getPayments = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const q = (req.query.q as string || '').toLowerCase();
  const status = req.query.status as string | undefined;
  const type = req.query.type as string | undefined;

  const payments = db.payments
    .filter((p: any) => canViewPayment(p, req, db))
    .filter((p: any) => (status ? p.status === status : true))
    .filter((p: any) => (type ? p.type === type : true))
    .filter((p: any) => (q ? `${p.transactionId || ''} ${p.method || ''}`.toLowerCase().includes(q) : true));

  res.json(payments);
});

export const createPayment = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const memberId = req.body.memberId || req.user.uid;
  const member = db.users.find((u: any) => u.uid === memberId);

  if (!member) throw new AppError('Member not found', 404);
  if (req.user.role === 'org_admin' && member.orgId !== req.user.orgId) {
    throw new AppError('Unauthorized member payment creation', 403);
  }

  const newPayment = {
    id: crypto.randomUUID(),
    memberId,
    orgId: member.orgId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: req.body.status || 'pending',
    type: req.body.type || 'payment',
    invoiceId: req.body.invoiceId || `INV-${Date.now()}`,
    receiptId: req.body.receiptId || null,
    ...req.body,
  };

  db.payments.push(newPayment);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: member.orgId,
    action: 'payment.create',
    entityType: 'payment',
    entityId: newPayment.id,
    details: { type: newPayment.type, amount: newPayment.amount, method: newPayment.method },
  });

  res.json({ success: true, payment: newPayment });
});

export const updatePayment = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.payments.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) throw new AppError('Payment not found', 404);

  const payment = db.payments[index];
  if (req.user.role === 'org_admin' && payment.orgId !== req.user.orgId) {
    throw new AppError('Unauthorized payment update', 403);
  }

  const nextStatus = req.body.status;
  db.payments[index] = {
    ...payment,
    ...req.body,
    updatedAt: new Date().toISOString(),
    receiptId: nextStatus === 'completed' && !payment.receiptId ? `REC-${Date.now()}` : payment.receiptId,
  };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: payment.orgId,
    action: 'payment.update',
    entityType: 'payment',
    entityId: payment.id,
    details: { status: db.payments[index].status },
  });

  res.json({ success: true, payment: db.payments[index] });
});

export const createSubscriptionPlan = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const plan = {
    id: `sub-${crypto.randomBytes(4).toString('hex')}`,
    orgId: req.user.role === 'super_admin' ? req.body.orgId : req.user.orgId,
    name: req.body.name,
    amount: req.body.amount,
    interval: req.body.interval || 'monthly',
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
  };
  if (!plan.orgId || !plan.name || !plan.amount) {
    throw new AppError('orgId, name, and amount are required', 400);
  }

  db.subscriptions.push(plan);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: plan.orgId,
    action: 'subscription.create',
    entityType: 'subscription',
    entityId: plan.id,
    details: { amount: plan.amount, interval: plan.interval },
  });

  res.status(201).json(plan);
});

export const getSubscriptionPlans = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const plans = db.subscriptions.filter((s: any) => {
    if (req.user.role === 'super_admin') return true;
    return s.orgId === req.user.orgId;
  });
  res.json(plans);
});

export const recordTransfer = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const record = {
    id: crypto.randomUUID(),
    memberId: req.body.memberId,
    orgId: req.user.role === 'super_admin' ? req.body.orgId : req.user.orgId,
    amount: req.body.amount,
    currency: req.body.currency || 'ETB',
    method: 'bank_transfer',
    transferReference: req.body.transferReference || `TRF-${Date.now()}`,
    status: req.body.status || 'pending',
    type: 'transfer',
    invoiceId: req.body.invoiceId || `INV-${Date.now()}`,
    receiptId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (!record.amount || !record.orgId) throw new AppError('amount and orgId are required', 400);

  db.payments.push(record);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: record.orgId,
    action: 'payment.transfer.record',
    entityType: 'payment',
    entityId: record.id,
    details: { amount: record.amount, transferReference: record.transferReference },
  });

  res.status(201).json(record);
});

export const initiateTelebirr = catchAsync(async (req: any, res: Response) => {
  const { amount, memberId } = req.body;
  const result = await PaymentService.initiateTelebirr(amount, memberId);
  res.json(result);
});

export const verifyOcr = catchAsync(async (req: any, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const result = await PaymentService.verifyOcr(req.file.buffer);
  res.json(result);
});

export const getInvoice = catchAsync(async (req: Request, res: Response) => {
  const pdfBytes = await PaymentService.generateInvoice(req.query);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBytes));
});

export const getReceipt = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.query,
    documentType: 'receipt',
  };
  const pdfBytes = await PaymentService.generateInvoice(payload);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from(pdfBytes));
});
