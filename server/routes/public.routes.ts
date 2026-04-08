import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public Experience Plan compatibility routes
router.get('/events', eventController.getPublicEvents);
router.get('/events/:id', eventController.getPublicEventById);
router.post('/events/:id/register', authenticateToken, eventController.registerForEvent);

export default router;
