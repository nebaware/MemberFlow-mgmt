import { Router } from 'express';
import * as miscController from '../controllers/misc.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/config', authenticateToken, miscController.getConfig);
router.get('/org/:slug', miscController.getOrgBySlug);
router.get('/organizations/list', miscController.getPublicOrgs);
router.post('/config', authenticateToken, isAdmin, miscController.updateConfig);

router.post('/fayda/verify', miscController.verifyFayda);
router.post('/otp/send', miscController.sendOtp);
router.post('/otp/verify', miscController.verifyOtp);

export default router;
