# Team Delivery Plans

This folder splits the project into separate execution tracks so multiple software teams can work in parallel without drifting from the same product vision.

## Planning Principles

- Each team owns one dashboard or feature domain end-to-end.
- Shared platform standards are defined once in the foundation plan and reused by all teams.
- UI delivery is not enough on its own. Every team plan includes frontend, backend, data, security, and QA responsibilities.
- Teams should not invent their own auth, API patterns, or status models. Reuse the conventions from the foundation plan.

## Recommended Team Split

Use the 7-team model as the default staffing plan for this project.

- [team-allocation-7-teams.md](/d:/memberflow-pro/docs/team-plans/team-allocation-7-teams.md)
- [team-allocation-6-teams.md](/d:/memberflow-pro/docs/team-plans/team-allocation-6-teams.md)

## File Map

- [platform-foundation-plan.md](/d:/memberflow-pro/docs/team-plans/platform-foundation-plan.md)
- [super-admin-dashboard-plan.md](/d:/memberflow-pro/docs/team-plans/super-admin-dashboard-plan.md)
- [organization-admin-dashboard-plan.md](/d:/memberflow-pro/docs/team-plans/organization-admin-dashboard-plan.md)
- [member-management-plan.md](/d:/memberflow-pro/docs/team-plans/member-management-plan.md)
- [event-management-plan.md](/d:/memberflow-pro/docs/team-plans/event-management-plan.md)
- [blog-announcements-plan.md](/d:/memberflow-pro/docs/team-plans/blog-announcements-plan.md)
- [payments-subscriptions-plan.md](/d:/memberflow-pro/docs/team-plans/payments-subscriptions-plan.md)
- [settings-profile-security-plan.md](/d:/memberflow-pro/docs/team-plans/settings-profile-security-plan.md)
- [public-experience-plan.md](/d:/memberflow-pro/docs/team-plans/public-experience-plan.md)
- [delivery-roadmap.md](/d:/memberflow-pro/docs/team-plans/delivery-roadmap.md)
- [gap-analysis.md](/d:/memberflow-pro/docs/team-plans/gap-analysis.md)
- [developer-prompt.md](/d:/memberflow-pro/docs/team-plans/developer-prompt.md)
- [team-ownership-matrix.md](/d:/memberflow-pro/docs/team-plans/team-ownership-matrix.md)
- [github-issues.md](/d:/memberflow-pro/docs/team-plans/github-issues.md)
- [sprint-1-tasks.md](/d:/memberflow-pro/docs/team-plans/sprint-1-tasks.md)
- [team-allocation-7-teams.md](/d:/memberflow-pro/docs/team-plans/team-allocation-7-teams.md)
- [team-allocation-6-teams.md](/d:/memberflow-pro/docs/team-plans/team-allocation-6-teams.md)
- [checklists](/d:/memberflow-pro/docs/team-plans/checklists)

## Delivery Order

1. Platform Foundation Team defines the shared schema, role model, API conventions, permissions, and seed data.
2. Super Admin Dashboard Team and Organization Admin Dashboard Team build their shells and navigation.
3. Member, Event, Blog, and Payments teams implement domain modules on top of the shared foundation.
4. Settings and Security rules are applied through the platform foundation ownership and feature-team implementations.
5. Public Experience and integration QA connect public event and registration surfaces to the same backend models and validate cross-team outputs.

## Cross-Team Rules

- No team should merge a feature that invents a new permission model without review from the Platform Foundation Team.
- No team should expose passwords, password hashes, or secrets in forms, logs, or API responses.
- Search, filters, pagination, import/export, and audit logs should follow a consistent platform pattern.
- Status fields must be normalized and documented in the relevant feature plan before implementation.
- Every team must contribute seed data and test cases for demo environments.

## Shared Milestone Gates

### Gate 1: Foundation Ready

- Shared schema approved
- Role model approved
- API naming conventions approved
- Navigation map approved
- Seed and demo data structure approved

### Gate 2: Admin Surfaces Functional

- Super Admin dashboard usable
- Organization Admin dashboard usable
- Shared auth and route guards enforced

### Gate 3: Core Modules Functional

- Members usable end-to-end
- Events usable end-to-end
- Blog usable end-to-end
- Payments usable end-to-end

### Gate 4: Production Hardening

- Security checks complete
- QA regression complete
- Audit logging complete
- Error states and empty states complete
- Demo-ready seed data complete
