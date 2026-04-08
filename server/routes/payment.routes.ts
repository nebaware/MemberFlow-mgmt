import { Router } from 'express';
import multer from 'multer';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticateToken, paymentController.getPayments);
router.post('/', authenticateToken, paymentController.createPayment);
router.patch('/:id', authenticateToken, isAdmin, paymentController.updatePayment);

router.get('/plans', authenticateToken, isAdmin, paymentController.getSubscriptionPlans);
router.post('/plans', authenticateToken, isAdmin, paymentController.createSubscriptionPlan);
router.post('/transfer', authenticateToken, isAdmin, paymentController.recordTransfer);

router.post('/telebirr/initiate', authenticateToken, paymentController.initiateTelebirr);
router.post('/ocr-verify', authenticateToken, upload.single('screenshot'), paymentController.verifyOcr);
router.get('/invoice/:paymentId', authenticateToken, paymentController.getInvoice);
router.get('/receipt/:paymentId', authenticateToken, paymentController.getReceipt);

export default router;
