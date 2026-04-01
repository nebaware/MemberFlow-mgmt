# Organization Admin Dashboard Plan

## Mission

Build the organization-level operations dashboard used by an organization admin to manage their own organization, members, events, blog content, payments, and profile settings.

## Dashboard Objective

This dashboard is the daily operating workspace for one organization. It should centralize all organization actions without exposing other organizations.

## User Persona

- Organization admin
- Membership coordinator
- Internal operations manager

## Key Features

- role-aware summary dashboard
- quick actions for member, event, post, and payment flows
- notification overview
- organization health and activity view
- deep links into feature modules

## In Scope

- Organization Admin dashboard landing page
- module shortcuts
- summary stats
- alerts
- recent activity
- route entry points into member, event, blog, payments, and settings modules

## Out of Scope

- Super admin capabilities
- Cross-organization reporting

## Data Needed

- organization profile
- member count by status
- active events count
- draft and published post count
- active subscription and payment summary
- pending invitations or approvals

## UI Modules

- Overview cards
- Recent members panel
- Upcoming events panel
- Recent announcements panel
- Billing snapshot panel
- Quick actions row

## Backend Tasks

- `GET /api/org-admin/dashboard/summary`
- `GET /api/org-admin/dashboard/activity`
- `GET /api/org-admin/dashboard/alerts`

## Frontend Tasks

- Build dashboard shell
- Build role-aware quick action entry points
- Build recent activity and alerts
- Build module cards with counts and statuses

## QA Tasks

- Verify org admins only see data for their organization
- Verify summary counts match module data
- Verify alerts and quick links behave correctly

## Definition of Done

- Organization admin has one clear entry point to run all organization operations
- Dashboard clearly shows organization-specific counts, alerts, and next actions
