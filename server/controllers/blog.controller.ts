import { Request, Response } from 'express';
import { dbService } from '../services/db.service.js';
import { catchAsync, AppError } from '../middleware/error.js';
import crypto from 'crypto';
import { logAudit } from '../services/audit.service.js';

const isBlogVisibleToUser = (blog: any, user: any) => {
  if (user?.role === 'super_admin') return true;
  return blog.orgId === user?.orgId;
};

export const getBlogs = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const q = (req.query.q as string || '').toLowerCase();
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;

  const blogs = db.blogs
    .filter((b: any) => isBlogVisibleToUser(b, req.user))
    .filter((b: any) => (category ? b.category === category : true))
    .filter((b: any) => (status ? b.status === status : true))
    .filter((b: any) => (q ? `${b.title} ${b.content}`.toLowerCase().includes(q) : true))
    .map((b: any) => {
      const author = db.users.find((u: any) => u.uid === b.authorId);
      return {
        ...b,
        authorName: author?.fullName || 'Unknown',
      };
    });

  res.json(blogs);
});

export const getPublicBlogs = catchAsync(async (_req: Request, res: Response) => {
  const db = dbService.get();
  const blogs = db.blogs
    .filter((b: any) => b.status === 'published' || b.isPublic)
    .map((b: any) => {
      const author = db.users.find((u: any) => u.uid === b.authorId);
      return {
        ...b,
        authorName: author?.fullName || 'Unknown',
      };
    });
  res.json(blogs);
});

export const createBlog = catchAsync(async (req: any, res: Response) => {
  const { title, content, category, status } = req.body;
  const db = dbService.get();

  const finalStatus = status || (req.body.isPublic ? 'published' : 'draft');

  const newBlog = {
    id: `blog-${crypto.randomBytes(4).toString('hex')}`,
    orgId: req.user.orgId,
    authorId: req.user.uid,
    title,
    content,
    category: category || 'General',
    status: finalStatus,
    isPublic: finalStatus === 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: finalStatus === 'published' ? new Date().toISOString() : null,
  };

  db.blogs.push(newBlog);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: req.user.orgId,
    action: 'blog.create',
    entityType: 'blog',
    entityId: newBlog.id,
    details: { status: newBlog.status },
  });

  res.status(201).json(newBlog);
});

export const updateBlog = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.blogs.findIndex((b: any) => b.id === req.params.id && isBlogVisibleToUser(b, req.user));
  if (index === -1) throw new AppError('Blog post not found', 404);

  const updates = { ...req.body };
  if (updates.status === 'published' && !db.blogs[index].publishedAt) {
    updates.publishedAt = new Date().toISOString();
    updates.isPublic = true;
  }
  if (updates.status === 'draft') {
    updates.isPublic = false;
  }

  db.blogs[index] = {
    ...db.blogs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: db.blogs[index].orgId,
    action: 'blog.update',
    entityType: 'blog',
    entityId: db.blogs[index].id,
    details: { fields: Object.keys(req.body || {}) },
  });

  res.json(db.blogs[index]);
});

export const deleteBlog = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const target = db.blogs.find((b: any) => b.id === req.params.id && isBlogVisibleToUser(b, req.user));
  if (!target) throw new AppError('Blog post not found', 404);

  db.blogs = db.blogs.filter((b: any) => b.id !== req.params.id);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: target.orgId,
    action: 'blog.delete',
    entityType: 'blog',
    entityId: target.id,
  });

  res.json({ success: true });
});
