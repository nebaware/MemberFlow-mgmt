import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticateToken, isSuperAdmin, adminController.getGlobalStats);
router.get('/logs', authenticateToken, isSuperAdmin, adminController.getSystemLogs);

export default router;
