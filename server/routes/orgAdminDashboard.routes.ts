import { Router } from 'express';
import * as orgAdminDashboardController from '../controllers/orgAdminDashboard.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authenticateToken, isAdmin, orgAdminDashboardController.getSummary);
router.get('/activity', authenticateToken, isAdmin, orgAdminDashboardController.getActivity);
router.get('/alerts', authenticateToken, isAdmin, orgAdminDashboardController.getAlerts);

export default router;
