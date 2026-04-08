import { Router } from 'express';
import * as orgController from '../controllers/organization.controller.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, isSuperAdmin, orgController.getOrganizations);
router.post('/', authenticateToken, isSuperAdmin, orgController.createOrganization);
router.patch('/:id', authenticateToken, isSuperAdmin, orgController.updateOrganization);
router.delete('/:id', authenticateToken, isSuperAdmin, orgController.deleteOrganization);

export default router;
