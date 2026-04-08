import { Response } from 'express';
import { dbService } from '../services/db.service.js';
import { catchAsync } from '../middleware/error.js';

export const getSummary = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const orgId = req.user.orgId;

  const members = db.users.filter((u: any) => u.role === 'member' && u.orgId === orgId);
  const events = db.events.filter((e: any) => e.orgId === orgId);
  const posts = db.blogs.filter((b: any) => b.orgId === orgId);
  const orgMemberUids = members.map((m: any) => m.uid);
  const orgPayments = db.payments.filter((p: any) => orgMemberUids.includes(p.memberId));

  res.json({
    memberCounts: {
      total: members.length,
      active: members.filter((m: any) => m.status === 'active').length,
      pending: members.filter((m: any) => m.status === 'pending').length,
      suspended: members.filter((m: any) => m.status === 'suspended').length,
    },
    eventsCounts: {
      total: events.length,
      published: events.filter((e: any) => e.status === 'published').length,
      draft: events.filter((e: any) => e.status === 'draft').length,
    },
    postCounts: {
      total: posts.length,
      published: posts.filter((b: any) => b.status === 'published').length,
      draft: posts.filter((b: any) => b.status === 'draft').length,
    },
    payments: {
      total: orgPayments.length,
      pending: orgPayments.filter((p: any) => p.status === 'pending').length,
      revenue: orgPayments.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
    },
  });
});

export const getActivity = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const orgId = req.user.orgId;
  const logs = (db.auditLogs || []).filter((l: any) => l.orgId === orgId).slice(0, 50);
  res.json(logs);
});

export const getAlerts = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const orgId = req.user.orgId;
  const members = db.users.filter((u: any) => u.role === 'member' && u.orgId === orgId);
  const pendingMembers = members.filter((m: any) => m.status === 'pending').length;
  const pendingPayments = db.payments.filter((p: any) => p.status === 'pending').filter((p: any) => {
    const member = db.users.find((u: any) => u.uid === p.memberId);
    return member?.orgId === orgId;
  }).length;

  const alerts = [];
  if (pendingMembers > 0) alerts.push({ type: 'members', level: 'warning', message: `${pendingMembers} members pending approval` });
  if (pendingPayments > 0) alerts.push({ type: 'payments', level: 'warning', message: `${pendingPayments} payments pending review` });

  res.json(alerts);
});
