# Delivery Roadmap

## Objective

Sequence the OMMS-style feature rollout so separate teams can work in parallel with controlled dependencies, predictable merge points, and minimal schema drift.

## Team Map

1. Platform Foundation Team
2. Super Admin Dashboard Team
3. Organization Admin Dashboard Team
4. Member Management Team
5. Event Management Team
6. Blog and Announcements Team
7. Payments and Subscriptions Team
8. Settings, Profile, and Security Team
9. Public Experience Team

## Week 1

### Platform Foundation Team

- Finalize organization-centric domain model
- Approve role matrix for `SUPER_ADMIN`, `ORG_ADMIN`, `ORG_MEMBER`
- Define API response standard, pagination format, and status enum conventions
- Define audit log events and notification event catalog
- Publish schema proposal and dependency notes to all teams

### Dashboard Teams

- Review schema proposal
- Freeze dashboard information architecture
- Finalize navigation map and route ownership
- Define required summary metrics for each dashboard

### Feature Teams

- Review their plan files
- Confirm entity dependencies
- Convert plans into engineering tickets
- Flag any schema gaps before Week 2

## Week 2

### Platform Foundation Team

- Implement schema and migrations
- Add seed data for organizations, users, roles, events, posts, and subscriptions
- Implement auth guards and organization-scoping helpers
- Implement shared query and filter utilities

### Super Admin Dashboard Team

- Build dashboard shell
- Build organizations listing UI
- Build top summary cards and search behavior

### Organization Admin Dashboard Team

- Build organization admin shell
- Build quick action panels and summary cards
- Wire dashboard to seed data or stable mock contracts

## Week 3

### Member Management Team

- Implement member list, add member flow, row actions, and role or status updates
- Implement import, export, and bulk actions contract

### Event Management Team

- Implement event list view
- Implement create and edit event flow
- Implement attendee status model and counts

### Blog and Announcements Team

- Implement post listing, create, edit, and publish flow
- Implement category and status filters

### Payments and Subscriptions Team

- Implement payment transactions table
- Implement create plan and manual payment flow
- Implement invoices and receipts first-pass data model

## Week 4

### Super Admin Dashboard Team

- Integrate organization actions with live APIs
- Add org admin overview and cross-org payments preview

### Organization Admin Dashboard Team

- Integrate member, event, post, and payments modules into dashboard shortcuts
- Add alerts, recent activity, and pending-work widgets

### Settings, Profile, and Security Team

- Implement secure profile editing
- Implement password change flow
- Implement organization profile editing
- Remove any password exposure from UI and APIs

## Week 5

### Public Experience Team

- Build public events listing from published event data
- Build event card and registration CTA flow
- Implement published-only visibility rules

### Event Management Team

- Implement reminder trigger flow
- Finalize attendee management UI

### Payments and Subscriptions Team

- Finalize invoice and receipt views
- Finalize payment status lifecycle and audit hooks

## Week 6

### Cross-Team Hardening Sprint

- QA regression across all modules
- Security review of access control and sensitive fields
- Audit log verification
- Empty state, error state, and loading state cleanup
- Seed data refinement for demo and staging

## Dependency Rules

- No feature team should merge organization-owned entities before Platform Foundation signs off.
- Super Admin and Organization Admin dashboard teams depend on stable role and route contracts.
- Public Experience depends on Event Management publishing rules.
- Settings and Security must review any feature that edits account or organization profile data.
- Payments and Subscriptions must align invoice or receipt IDs with the shared data model.

## Merge Gates

### Gate A

- Schema approved
- role matrix approved
- seed data approved

### Gate B

- both dashboards render with real data contracts
- organization scoping enforced

### Gate C

- members, events, blog, and payments usable end-to-end

### Gate D

- public event experience usable
- security hardening complete
- QA signoff complete

## Release Recommendation

- Release internal admin modules first behind admin access.
- Release public event discovery only after event publishing and registration rules are stable.
- Do not release settings or profile editing until password and sensitive data handling are verified.
