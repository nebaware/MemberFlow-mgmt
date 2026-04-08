import { Router } from 'express';
import * as superAdminController from '../controllers/superAdmin.controller.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/organizations', authenticateToken, isSuperAdmin, superAdminController.listOrganizations);
router.post('/organizations', authenticateToken, isSuperAdmin, superAdminController.createOrganization);
router.patch('/organizations/:id', authenticateToken, isSuperAdmin, superAdminController.updateOrganization);
router.post('/organizations/:id/suspend', authenticateToken, isSuperAdmin, superAdminController.suspendOrganization);

router.get('/org-admins', authenticateToken, isSuperAdmin, superAdminController.listOrgAdmins);
router.get('/members', authenticateToken, isSuperAdmin, superAdminController.listMembers);
router.get('/payments', authenticateToken, isSuperAdmin, superAdminController.listPayments);

router.get('/system-config', authenticateToken, isSuperAdmin, superAdminController.getSystemConfig);
router.patch('/system-config', authenticateToken, isSuperAdmin, superAdminController.patchSystemConfig);

export default router;
