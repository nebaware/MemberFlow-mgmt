import { Router } from 'express';
import * as eventController from '../controllers/event.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/public', eventController.getPublicEvents);
router.get('/public/:id', eventController.getPublicEventById);

// Protected routes
router.get('/', authenticateToken, eventController.getEvents);
router.post('/', authenticateToken, isAdmin, eventController.createEvent);
router.patch('/:id', authenticateToken, isAdmin, eventController.updateEvent);
router.delete('/:id', authenticateToken, isAdmin, eventController.deleteEvent);
router.post('/:id/remind', authenticateToken, isAdmin, eventController.triggerReminder);
router.get('/:id/attendees', authenticateToken, isAdmin, eventController.getAttendees);
router.patch('/:id/attendees/:uid', authenticateToken, isAdmin, eventController.updateAttendee);
router.post('/:id/register', authenticateToken, eventController.registerForEvent);

export default router;
