# Team Ownership Matrix

## Purpose

This file defines which team owns which parts of the codebase, APIs, and data model. It exists to prevent cross-team interference while still allowing controlled shared dependency changes.

## Ownership Rules

- A team may fully change files in its owned area.
- A team may make minimal changes in shared dependency areas only when required by its assigned feature.
- A team must not redesign or refactor another team's owned feature area without explicit coordination.
- Platform Foundation Team reviews all schema, auth, permission, and shared API contract changes.

## Team Ownership

### Platform Foundation Team

- Primary ownership:
- [server/index.ts](/d:/memberflow-pro/server/index.ts)
- [server/middleware](/d:/memberflow-pro/server/middleware)
- [server/config](/d:/memberflow-pro/server/config)
- [src/AuthContext.tsx](/d:/memberflow-pro/src/AuthContext.tsx)
- [src/services.ts](/d:/memberflow-pro/src/services.ts)
- Shared entity or schema definitions when introduced

- Shared dependency authority:
- auth rules
- role model
- API response shapes
- status enums
- audit logging
- notifications

### Super Admin Dashboard Team

- Primary ownership:
- [src/SuperAdminDashboard.tsx](/d:/memberflow-pro/src/SuperAdminDashboard.tsx)
- super-admin-only support components when introduced
- [server/routes/admin.routes.ts](/d:/memberflow-pro/server/routes/admin.routes.ts)
- [server/routes/organization.routes.ts](/d:/memberflow-pro/server/routes/organization.routes.ts)
- [server/controllers/admin.controller.ts](/d:/memberflow-pro/server/controllers/admin.controller.ts)
- [server/controllers/organization.controller.ts](/d:/memberflow-pro/server/controllers/organization.controller.ts)

### Organization Admin Dashboard Team

- Primary ownership:
- [src/OrgAdminDashboard.tsx](/d:/memberflow-pro/src/OrgAdminDashboard.tsx)
- shared org-admin overview widgets when introduced

- Shared dependency areas:
- [src/AdminPanel.tsx](/d:/memberflow-pro/src/AdminPanel.tsx)
- [src/Payments.tsx](/d:/memberflow-pro/src/Payments.tsx)
- [src/Events.tsx](/d:/memberflow-pro/src/Events.tsx)
- [src/Blogs.tsx](/d:/memberflow-pro/src/Blogs.tsx)

### Member Management Team

- Primary ownership:
- [src/AdminPanel.tsx](/d:/memberflow-pro/src/AdminPanel.tsx) for member administration flows
- [src/Registration.tsx](/d:/memberflow-pro/src/Registration.tsx) for member onboarding updates if required
- [server/routes/member.routes.ts](/d:/memberflow-pro/server/routes/member.routes.ts)
- [server/controllers/member.controller.ts](/d:/memberflow-pro/server/controllers/member.controller.ts)

### Event Management Team

- Primary ownership:
- [src/Events.tsx](/d:/memberflow-pro/src/Events.tsx)
- event-specific support components when introduced
- [server/routes/event.routes.ts](/d:/memberflow-pro/server/routes/event.routes.ts)
- [server/controllers/event.controller.ts](/d:/memberflow-pro/server/controllers/event.controller.ts)

### Blog and Announcements Team

- Primary ownership:
- [src/Blogs.tsx](/d:/memberflow-pro/src/Blogs.tsx)
- blog-specific support components when introduced
- [server/routes/blog.routes.ts](/d:/memberflow-pro/server/routes/blog.routes.ts)
- [server/controllers/blog.controller.ts](/d:/memberflow-pro/server/controllers/blog.controller.ts)

### Payments and Subscriptions Team

- Primary ownership:
- [src/Payments.tsx](/d:/memberflow-pro/src/Payments.tsx)
- payment and billing support components when introduced
- [server/routes/payment.routes.ts](/d:/memberflow-pro/server/routes/payment.routes.ts)
- [server/controllers/payment.controller.ts](/d:/memberflow-pro/server/controllers/payment.controller.ts)

### Settings, Profile, and Security Team

- Primary ownership:
- [src/Profile.tsx](/d:/memberflow-pro/src/Profile.tsx)
- account or settings support components when introduced
- [server/routes/misc.routes.ts](/d:/memberflow-pro/server/routes/misc.routes.ts) for config and OTP only
- [server/controllers/misc.controller.ts](/d:/memberflow-pro/server/controllers/misc.controller.ts) for config and OTP only

### Public Experience Team

- Primary ownership:
- [src/LandingPage.tsx](/d:/memberflow-pro/src/LandingPage.tsx)
- public marketing or public discovery routes when introduced
- public event and blog preview rendering

### Member Dashboard Team

- Primary ownership:
- [src/MemberDashboard.tsx](/d:/memberflow-pro/src/MemberDashboard.tsx)
- member-only navigation and dashboard widgets

## Shared Files That Need Extra Care

- [src/App.tsx](/d:/memberflow-pro/src/App.tsx)
- [src/AuthContext.tsx](/d:/memberflow-pro/src/AuthContext.tsx)
- [src/services.ts](/d:/memberflow-pro/src/services.ts)
- [server/index.ts](/d:/memberflow-pro/server/index.ts)

Changes to these files must be narrow and tied to a documented dependency.

## Conflict Resolution

- If two teams need the same shared file, Platform Foundation Team decides the contract.
- If a feature needs a new route or status enum, add it only after documenting it in the relevant plan or issue.
- If a team discovers missing shared infrastructure, raise it as a foundation dependency instead of improvising inside feature code.
