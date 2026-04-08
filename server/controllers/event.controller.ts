import { Request, Response } from 'express';
import { dbService } from '../services/db.service.js';
import { catchAsync, AppError } from '../middleware/error.js';
import crypto from 'crypto';
import { logAudit } from '../services/audit.service.js';

const isEventVisibleToUser = (event: any, user: any) => {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  return event.orgId === user.orgId;
};

export const getEvents = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const q = (req.query.q as string || '').toLowerCase();
  const status = req.query.status as string | undefined;

  const events = db.events.filter((e: any) => {
    if (!isEventVisibleToUser(e, req.user)) return false;
    if (status && e.status !== status) return false;
    if (q && !(`${e.title} ${e.description} ${e.location}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const hydrated = events.map((e: any) => ({
    ...e,
    attendeeCount: Array.isArray(e.attendees) ? e.attendees.length : 0,
    remainingCapacity: typeof e.capacity === 'number' ? Math.max(e.capacity - (e.attendees?.length || 0), 0) : null,
  }));

  res.json(hydrated);
});

export const getPublicEvents = catchAsync(async (_req: Request, res: Response) => {
  const db = dbService.get();
  const events = db.events.filter((e: any) => e.status === 'published');
  res.json(events);
});

export const getPublicEventById = catchAsync(async (req: Request, res: Response) => {
  const db = dbService.get();
  const event = db.events.find((e: any) => e.id === req.params.id && e.status === 'published');
  if (!event) throw new AppError('Event not found', 404);

  res.json({
    ...event,
    attendeeCount: Array.isArray(event.attendees) ? event.attendees.length : 0,
    remainingCapacity: typeof event.capacity === 'number' ? Math.max(event.capacity - (event.attendees?.length || 0), 0) : null,
  });
});

export const createEvent = catchAsync(async (req: any, res: Response) => {
  const { title, description, date, location, capacity, imageUrl, status } = req.body;
  const db = dbService.get();

  const newEvent = {
    id: `evt-${crypto.randomBytes(4).toString('hex')}`,
    orgId: req.user.orgId,
    title,
    description,
    date,
    location,
    capacity: typeof capacity === 'number' ? capacity : 0,
    imageUrl: imageUrl || '',
    attendees: [],
    status: status || 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: status === 'published' ? new Date().toISOString() : null,
  };

  db.events.push(newEvent);
  dbService.save(db);
  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: req.user.orgId,
    action: 'event.create',
    entityType: 'event',
    entityId: newEvent.id,
    details: { status: newEvent.status },
  });
  res.status(201).json(newEvent);
});

export const updateEvent = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.events.findIndex((e: any) => e.id === req.params.id && isEventVisibleToUser(e, req.user));
  if (index === -1) throw new AppError('Event not found', 404);

  const updates = { ...req.body };
  if (updates.status === 'published' && !db.events[index].publishedAt) {
    updates.publishedAt = new Date().toISOString();
  }

  db.events[index] = {
    ...db.events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: db.events[index].orgId,
    action: 'event.update',
    entityType: 'event',
    entityId: db.events[index].id,
    details: { fields: Object.keys(req.body || {}) },
  });

  res.json(db.events[index]);
});

export const deleteEvent = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const target = db.events.find((e: any) => e.id === req.params.id && isEventVisibleToUser(e, req.user));
  if (!target) throw new AppError('Event not found', 404);

  db.events = db.events.filter((e: any) => e.id !== req.params.id);
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: target.orgId,
    action: 'event.delete',
    entityType: 'event',
    entityId: target.id,
  });

  res.json({ success: true });
});

export const registerForEvent = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const index = db.events.findIndex((e: any) => e.id === req.params.id && e.status === 'published');
  if (index === -1) throw new AppError('Event not found', 404);

  const event = db.events[index];
  if (event.capacity > 0 && event.attendees.length >= event.capacity) {
    throw new AppError('Event is at capacity', 400);
  }

  const existing = event.attendees.find((a: any) => a.uid === req.user.uid);
  if (existing) {
    return res.json({ success: true, attendee: existing, alreadyRegistered: true });
  }

  const attendee = {
    uid: req.user.uid,
    status: 'registered',
    registeredAt: new Date().toISOString(),
  };
  event.attendees.push(attendee);
  event.updatedAt = new Date().toISOString();
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: event.orgId,
    action: 'event.register',
    entityType: 'event',
    entityId: event.id,
  });

  res.json({ success: true, attendee });
});

export const getAttendees = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const event = db.events.find((e: any) => e.id === req.params.id && isEventVisibleToUser(e, req.user));
  if (!event) throw new AppError('Event not found', 404);

  const attendees = (event.attendees || []).map((a: any) => {
    const user = db.users.find((u: any) => u.uid === a.uid);
    return {
      ...a,
      fullName: user?.fullName || 'Unknown',
      email: user?.email || '',
    };
  });

  res.json(attendees);
});

export const updateAttendee = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const event = db.events.find((e: any) => e.id === req.params.id && isEventVisibleToUser(e, req.user));
  if (!event) throw new AppError('Event not found', 404);

  const attendee = event.attendees?.find((a: any) => a.uid === req.params.uid);
  if (!attendee) throw new AppError('Attendee not found', 404);

  attendee.status = req.body.status || attendee.status;
  attendee.updatedAt = new Date().toISOString();
  event.updatedAt = new Date().toISOString();
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: event.orgId,
    action: 'event.attendee.update',
    entityType: 'event',
    entityId: event.id,
    details: { attendeeUid: attendee.uid, status: attendee.status },
  });

  res.json({ success: true, attendee });
});

export const triggerReminder = catchAsync(async (req: any, res: Response) => {
  const db = dbService.get();
  const event = db.events.find((e: any) => e.id === req.params.id && isEventVisibleToUser(e, req.user));
  if (!event) throw new AppError('Event not found', 404);

  event.lastReminderAt = new Date().toISOString();
  event.updatedAt = new Date().toISOString();
  dbService.save(db);

  logAudit({
    actorUid: req.user.uid,
    actorRole: req.user.role,
    orgId: event.orgId,
    action: 'event.reminder.trigger',
    entityType: 'event',
    entityId: event.id,
    details: { attendeeCount: event.attendees?.length || 0 },
  });

  res.json({ success: true, reminderTriggeredAt: event.lastReminderAt, attendeeCount: event.attendees?.length || 0 });
});
