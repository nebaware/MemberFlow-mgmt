# Public Experience Plan

## Mission

Build the public-facing surfaces that expose approved organization content to visitors and members, especially event discovery and registration.

## Feature Objective

The public layer should reuse the same event and content records managed by organization admins, but only expose approved or published content.

## Core Features

- public events page
- event card grid
- register now CTA
- date, time, location, capacity, and organization metadata
- public content visibility rules

## In Scope

- public events listing
- event detail or registration entry point
- published-only filtering
- UI consistency with admin-managed content

## Out of Scope

- advanced public marketing pages unrelated to OMMS
- independent public CMS

## Backend Tasks

- `GET /api/public/events`
- `GET /api/public/events/:id`
- `POST /api/public/events/:id/register`

## Frontend Tasks

- public event listing page
- event card component
- registration CTA and status handling
- empty states and error handling

## Data Rules

- only published events are public
- cancelled events must not accept registration
- public content must not leak draft or internal metadata

## QA Tasks

- Verify unpublished events are hidden
- Verify registration only works on valid published events
- Verify public pages never expose admin-only fields

## Definition of Done

- Public users can discover and register for approved events using data managed by admin teams
