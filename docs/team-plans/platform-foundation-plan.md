# Platform Foundation Plan

## Mission

Create the shared technical foundation that all dashboard and feature teams build on. This team owns the role model, database design, base APIs, shared UI conventions, route protection, audit logging, and demo data strategy.

## Product Problem

The current project has marketplace-oriented entities and role flows. The new OMMS-style features require additional organization-centric entities and permissions. If teams build directly on the current codebase without a shared platform layer, they will produce conflicting models and duplicated logic.

## Primary Goals

- Introduce organization-based domain modeling.
- Define a clean separation between super admin, organization admin, and organization member access.
- Establish shared API patterns and response formats.
- Define status enums and permission rules across all modules.
- Create platform seed data and migration strategy.

## In Scope

- Database schema design for organizations and OMMS modules.
- Shared role and permission architecture.
- Common backend service boundaries.
- Audit log and notification foundation.
- Base admin route guards and authorization helpers.
- Shared query, filtering, pagination, and export contract.
- Demo and seed data conventions.

## Out of Scope

- Feature-specific UI polish.
- Individual module CRUD screens.
- Public marketing content.

## Proposed Core Entities

- `Organization`
- `OrganizationAdmin`
- `OrganizationMember`
- `MembershipRole`
- `Event`
- `EventAttendee`
- `AnnouncementPost`
- `SubscriptionPlan`
- `OrganizationSubscription`
- `PaymentTransaction`
- `Invoice`
- `Receipt`
- `Invitation`
- `SystemConfig`

## Role Model

- `SUPER_ADMIN`: full platform visibility and system-level control
- `ORG_ADMIN`: manages one organization and its member-facing modules
- `ORG_MEMBER`: standard organization membership and event participation
- Optional later roles:
- `FINANCE_ADMIN`
- `CONTENT_EDITOR`
- `EVENT_MANAGER`

## Technical Deliverables

- Prisma schema extension or new module schema design
- migration plan for existing environments
- shared auth helper functions for route-level checks
- permission matrix document
- base API response format
- shared filters and pagination utility
- audit logging service
- notification event catalog
- seed strategy for super admin, org admin, org members, organizations, events, posts, and payments

## Backend Workstreams

### Workstream 1: Data Model

- Finalize all organization-centric entities
- Define relationships and ownership rules
- Normalize statuses and lifecycle states

### Workstream 2: Access Control

- Build reusable permission helpers
- Enforce route-level and action-level authorization
- Add access checks to all module APIs

### Workstream 3: Shared Services

- pagination and search helper
- import and export service contract
- audit logging service
- invitation service
- notification service

### Workstream 4: Demo Data

- Seed at least two organizations
- Seed at least one super admin
- Seed at least two org admins
- Seed members, events, posts, subscriptions, and payments

## Frontend Foundation Workstreams

- Shared admin layout patterns
- Shared table actions pattern
- Shared create and edit modal pattern
- Shared status badge system
- Shared empty and loading states

## Coordination Dependencies

- All feature teams depend on this plan
- This team must review every feature PR that changes role logic or schema assumptions

## Milestones

### Milestone 1

- permission matrix complete
- entity map complete
- route map complete

### Milestone 2

- schema implemented
- seed data implemented
- auth helpers implemented

### Milestone 3

- shared API patterns implemented
- audit and notification hooks implemented

## Definition of Done

- A new developer can build any module without guessing entity ownership or permission logic
- Shared seed data makes all dashboards testable
- All teams have stable contracts for data and access control
