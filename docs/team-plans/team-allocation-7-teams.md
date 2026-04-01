# Team Allocation for 7 Developer Teams

## Purpose

This file converts the planning set into a practical staffing model for 7 parallel developer teams. Use this when assigning ownership after the project is pushed and cloned by developers.

## How To Assign Work

Give each team exactly one ownership block from this file plus the linked plan, checklist, and prompt.

Each team must receive:

- one team assignment from this file
- one primary plan file
- one checklist file
- the shared files:
- [delivery-roadmap.md](/d:/memberflow-pro/docs/team-plans/delivery-roadmap.md)
- [gap-analysis.md](/d:/memberflow-pro/docs/team-plans/gap-analysis.md)
- [developer-prompt.md](/d:/memberflow-pro/docs/team-plans/developer-prompt.md)
- [team-ownership-matrix.md](/d:/memberflow-pro/docs/team-plans/team-ownership-matrix.md)

## Team 1: Platform Foundation and Security

### Ownership

- platform contracts
- auth and roles
- shared APIs
- sensitive-data handling
- settings and security flows

### Main files

- [platform-foundation-plan.md](/d:/memberflow-pro/docs/team-plans/platform-foundation-plan.md)
- [settings-profile-security-plan.md](/d:/memberflow-pro/docs/team-plans/settings-profile-security-plan.md)
- [checklists/platform-foundation-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/platform-foundation-checklist.md)
- [checklists/settings-profile-security-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/settings-profile-security-checklist.md)

### Expected deliverables

- role matrix finalized
- shared response format finalized
- settings and password flow hardened
- no password or secret exposure anywhere

## Team 2: Super Admin and Organization Governance

### Ownership

- super admin dashboard
- organizations module
- org admin oversight
- system-level visibility

### Main files

- [super-admin-dashboard-plan.md](/d:/memberflow-pro/docs/team-plans/super-admin-dashboard-plan.md)
- [checklists/super-admin-dashboard-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/super-admin-dashboard-checklist.md)

### Expected deliverables

- organizations CRUD complete
- org status actions complete
- org admin and cross-org summaries complete

## Team 3: Organization Admin Dashboard and Member Management

### Ownership

- organization admin dashboard
- member listing and moderation
- add member flow
- member import or export and bulk actions

### Main files

- [organization-admin-dashboard-plan.md](/d:/memberflow-pro/docs/team-plans/organization-admin-dashboard-plan.md)
- [member-management-plan.md](/d:/memberflow-pro/docs/team-plans/member-management-plan.md)
- [checklists/organization-admin-dashboard-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/organization-admin-dashboard-checklist.md)
- [checklists/member-management-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/member-management-checklist.md)

### Expected deliverables

- organization admin landing page complete
- member create and edit complete
- import, export, and bulk actions complete

## Team 4: Event Management and Public Registration

### Ownership

- event CRUD
- attendee management
- reminders
- public event discovery
- event registration flow

### Main files

- [event-management-plan.md](/d:/memberflow-pro/docs/team-plans/event-management-plan.md)
- [public-experience-plan.md](/d:/memberflow-pro/docs/team-plans/public-experience-plan.md)
- [checklists/event-management-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/event-management-checklist.md)
- [checklists/public-experience-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/public-experience-checklist.md)

### Expected deliverables

- list and calendar event views complete
- attendee management complete
- published event registration live

## Team 5: Blog, Announcements, and Content Workflow

### Ownership

- blog module
- announcements
- draft and publish workflow
- category and status filtering
- author and publishing metadata

### Main files

- [blog-announcements-plan.md](/d:/memberflow-pro/docs/team-plans/blog-announcements-plan.md)
- [checklists/blog-announcements-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/blog-announcements-checklist.md)

### Expected deliverables

- post CRUD complete
- draft versus published flow complete
- filterable content management complete

## Team 6: Payments and Subscriptions

### Ownership

- payment operations
- manual payment and transfer recording
- invoices and receipts
- subscription plans
- billing state

### Main files

- [payments-subscriptions-plan.md](/d:/memberflow-pro/docs/team-plans/payments-subscriptions-plan.md)
- [checklists/payments-subscriptions-checklist.md](/d:/memberflow-pro/docs/team-plans/checklists/payments-subscriptions-checklist.md)

### Expected deliverables

- subscriptions added on top of current payment module
- invoices and receipts workspace complete
- payment status flow normalized

## Team 7: Member Experience and Integration QA

### Ownership

- member dashboard
- profile completion flow
- cross-module integration QA
- regression validation across team outputs

### Main files

- [gap-analysis.md](/d:/memberflow-pro/docs/team-plans/gap-analysis.md)
- [sprint-1-tasks.md](/d:/memberflow-pro/docs/team-plans/sprint-1-tasks.md)
- [developer-prompt.md](/d:/memberflow-pro/docs/team-plans/developer-prompt.md)

### Expected deliverables

- member dashboard improved where needed
- integration issues caught early
- acceptance validation across events, blogs, payments, and profile flows

## What You Tell Each Team

Use this structure exactly:

- Your team is `Team X: <name>`
- Your ownership is only what is listed in `team-allocation-7-teams.md`
- Your main plan file is `<plan-file>`
- Your checklist file is `<checklist-file>`
- You must follow [developer-prompt.md](/d:/memberflow-pro/docs/team-plans/developer-prompt.md)
- You must not modify other teams' feature areas except documented shared dependencies

## Recommended Assignment Order

1. Team 1 starts first
2. Team 2 and Team 3 start once Team 1 publishes role and contract decisions
3. Team 4, Team 5, and Team 6 start after shared status and API rules are confirmed
4. Team 7 runs in parallel once feature teams begin merging work

## Important Note

If you want only 6 teams instead of 7, merge Team 7 into Team 3 or Team 1. Keep Team 1 separate in all cases.
