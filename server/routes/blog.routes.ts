import { Router } from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/public', blogController.getPublicBlogs);

// Protected routes
router.get('/', authenticateToken, blogController.getBlogs);
router.post('/', authenticateToken, isAdmin, blogController.createBlog);
router.patch('/:id', authenticateToken, isAdmin, blogController.updateBlog);
router.delete('/:id', authenticateToken, isAdmin, blogController.deleteBlog);

export default router;
