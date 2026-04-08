import { Router } from 'express';
import * as memberController from '../controllers/member.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, isAdmin, memberController.getMembers);
router.post('/', authenticateToken, isAdmin, memberController.createMember);
router.post('/import', authenticateToken, isAdmin, memberController.importMembers);
router.get('/export', authenticateToken, isAdmin, memberController.exportMembers);
router.post('/bulk', authenticateToken, isAdmin, memberController.bulkMemberAction);
router.patch('/:uid', authenticateToken, isAdmin, memberController.updateMember);
router.delete('/:uid', authenticateToken, isAdmin, memberController.deleteMember);

export default router;
