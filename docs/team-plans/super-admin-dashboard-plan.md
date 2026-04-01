# Super Admin Dashboard Plan

## Mission

Build the cross-organization control plane used by platform operators to manage organizations, org admins, members, payments, and system configuration.

## Dashboard Objective

This dashboard should answer three questions quickly:

- What organizations exist on the platform
- Who owns them and what plan they are on
- What issues require platform-level action

## User Persona

- Platform owner
- Internal operations lead
- Support or compliance lead with elevated access

## Key Features

- Organizations listing
- Add organization modal
- edit organization flow
- suspend or block organization action
- organization search and pagination
- org admin listing
- member listing across organizations
- payment visibility across organizations
- system config management
- notification and alert center

## In Scope

- Super Admin dashboard shell
- organizations table
- create, edit, suspend, delete actions
- org admin overview
- platform member overview
- payment summary surface
- system config page shell

## Out of Scope

- Organization-level member CRUD details
- Organization-specific event and blog editing

## Data Needed

- organization metadata
- organization member counts
- org admin owner mapping
- plan and billing state
- org status
- compliance or support flags

## UI Modules

- Top summary cards
- Search bar
- Notification bell
- Organizations table
- Add Organization modal
- OrgAdmin quick access panel
- Cross-org payments preview
- System Config shortcut section

## Backend Tasks

- `GET /api/super-admin/organizations`
- `POST /api/super-admin/organizations`
- `PATCH /api/super-admin/organizations/:id`
- `POST /api/super-admin/organizations/:id/suspend`
- `GET /api/super-admin/org-admins`
- `GET /api/super-admin/members`
- `GET /api/super-admin/payments`
- `GET /api/super-admin/system-config`
- `PATCH /api/super-admin/system-config`

## Frontend Tasks

- Build dashboard shell and navigation
- Build organizations table with actions
- Build create and edit organization modal
- Build org admin and payments preview cards
- Build loading, empty, and error states

## QA Tasks

- Verify cross-org visibility rules
- Verify only super admins can access these routes
- Verify create or suspend organization actions are audited
- Verify pagination and search behavior

## Definition of Done

- Super admin can create and manage organizations
- Super admin can view org admins and members across organizations
- Super admin can inspect payment state across organizations
- All actions are audited and permission-protected
