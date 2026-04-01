# Event Management Plan

## Mission

Build the internal and public event workflow, including event CRUD, attendee management, reminders, list and calendar views, and public registration readiness.

## Feature Objective

Organization admins should be able to create and manage events quickly, while public users or members can discover published events and register.

## Core Features

- event list view
- event calendar view
- create event form
- edit event form
- delete event action
- filter and search
- attendee count and capacity tracking
- send reminders
- manage attendees
- event image upload
- public event card display
- register CTA

## In Scope

- Org Admin event management UI
- public event listing support
- event publishing state
- attendee records
- capacity tracking
- reminder trigger interface

## Out of Scope

- Full email marketing platform
- Advanced calendar sync in first release

## Backend Tasks

- `GET /api/events`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `GET /api/events/:id/attendees`
- `POST /api/events/:id/reminders`
- `POST /api/events/:id/register`

## Frontend Tasks

- event list view
- calendar view
- create and edit event form
- attendee panel
- reminder action
- public event card grid
- public register flow

## Data Model Notes

- event status should support at least `draft`, `published`, `cancelled`
- attendee status should support at least `registered`, `confirmed`, `cancelled`, `attended`
- capacity must not be exceeded without explicit override logic

## QA Tasks

- Verify published-only events are public
- Verify attendee count updates correctly
- Verify reminders only target valid attendees
- Verify draft events are hidden from public views

## Definition of Done

- Organization admins can manage events end-to-end
- Public or member-facing event pages show accurate published events
- Registration and attendee tracking work consistently
