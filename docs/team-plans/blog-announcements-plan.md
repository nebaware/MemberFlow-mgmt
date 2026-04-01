# Blog and Announcements Plan

## Mission

Build the organization communication module for posts, announcements, categories, and publishing workflows.

## Feature Objective

Organization admins need a controlled way to publish internal or public updates with status, category, author attribution, and filtering.

## Core Features

- create post
- edit post
- delete post
- draft and publish states
- category filtering
- post search
- author and published time display
- announcement card layout

## In Scope

- blog and announcement admin UI
- post CRUD APIs
- category and status filters
- published and draft state management

## Out of Scope

- Rich editorial collaboration
- comments system
- SEO-heavy public blog engine

## Backend Tasks

- `GET /api/posts`
- `POST /api/posts`
- `PATCH /api/posts/:id`
- `DELETE /api/posts/:id`
- `POST /api/posts/:id/publish`

## Frontend Tasks

- post card grid
- create post modal or page
- edit form
- filter bar
- author and status badges

## Content Rules

- drafts are organization-visible only
- published visibility rules must be explicit
- authorship must be tracked
- categories must be normalized

## QA Tasks

- Verify drafts and published states behave correctly
- Verify category and search filters
- Verify only authorized users can publish or delete

## Definition of Done

- Organization admins can create, manage, and publish posts
- Draft and published states are enforced consistently
