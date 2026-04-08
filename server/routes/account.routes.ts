import { Router } from 'express';
import * as accountController from '../controllers/account.controller.js';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/profile', authenticateToken, accountController.getProfile);
router.patch('/profile', authenticateToken, accountController.patchProfile);
router.patch('/organization-profile', authenticateToken, accountController.patchOrganizationProfile);
router.get('/audit', authenticateToken, accountController.getAudit);

// Settings plan compatibility
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/profile-photo', authenticateToken, authController.updateProfilePhoto);

export default router;
