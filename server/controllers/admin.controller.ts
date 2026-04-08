import { Response } from 'express';
import { dbService } from '../services/db.service.js';
import { catchAsync } from '../middleware/error.js';

export const getGlobalStats = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();

  const paymentsByOrg = db.organizations.map((org: any) => {
    const orgMembers = db.users.filter((u: any) => u.orgId === org.id).map((u: any) => u.uid);
    const orgPayments = db.payments.filter((p: any) => orgMembers.includes(p.memberId));

    return {
      orgId: org.id,
      orgName: org.name,
      totalAmount: orgPayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
      completedAmount: orgPayments.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
      count: orgPayments.length,
    };
  });

  const stats = {
    totalOrganizations: db.organizations.length,
    activeUserCount: db.users.filter((u: any) => u.status === 'active').length,
    totalMembers: db.users.filter((u: any) => u.role === 'member').length,
    totalRevenue: db.payments.filter((p: any) => p.status === 'completed').reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0),
    orgStats: db.organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      memberCount: db.users.filter((u: any) => u.orgId === org.id && u.role === 'member').length,
      active: org.status === 'active',
    })),
    paymentsByOrg,
    recentPayments: db.payments
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10),
  };

  res.json(stats);
});

export const getSystemLogs = catchAsync(async (_req: any, res: Response) => {
  const db = dbService.get();
  const logs = Array.isArray(db.auditLogs) ? db.auditLogs : [];
  res.json(logs.slice(0, 200));
});
