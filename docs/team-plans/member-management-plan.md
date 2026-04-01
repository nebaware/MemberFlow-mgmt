# Member Management Plan

## Mission

Deliver the full member management workflow for organization admins and the supporting cross-org visibility for super admins.

## Feature Objective

Support the member lifecycle from invitation or creation through activation, role updates, messaging, export, import, and removal.

## Core Features

- add member form
- edit member flow
- remove or deactivate member
- member status management
- member role assignment
- search
- filters
- import
- export
- bulk actions
- message action
- join date and last active display

## In Scope

- Org Admin member list
- Super Admin cross-org member list
- Add Member flow
- import or export endpoints
- bulk status and role actions
- audit log integration

## Out of Scope

- Full chat or messaging system implementation
- External identity provider sync

## Backend Tasks

- `GET /api/members`
- `POST /api/members`
- `PATCH /api/members/:id`
- `DELETE /api/members/:id`
- `POST /api/members/import`
- `GET /api/members/export`
- `POST /api/members/bulk-actions`
- `POST /api/members/:id/invite`

## Frontend Tasks

- member listing table
- add member modal or page
- edit form
- status and role controls
- import and export triggers
- bulk selection and bulk actions
- row action menu

## Data Rules

- email must be unique within the platform
- organization membership must be explicit
- role changes must be audited
- destructive actions require confirmation

## QA Tasks

- Verify org scoping
- Verify import validation
- Verify export format
- Verify bulk actions do not cross organization boundaries
- Verify last active data is displayed correctly

## Definition of Done

- Org admin can fully manage members inside one organization
- Super admin can inspect members across organizations
- All role and status changes are permission-checked and logged
