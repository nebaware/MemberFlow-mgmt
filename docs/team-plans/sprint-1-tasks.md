# Sprint 1 Tasks

## Goal

Complete the highest-leverage work that unlocks all teams without forcing rework.

## Sprint 1 Priority

- Freeze platform contracts
- stabilize dashboard entry points
- finish the highest-gap admin workflows already partially built

## Team Assignments

### Platform Foundation Team

- Finalize role matrix and ownership rules
- Define shared API response format
- Define normalized status values
- Define seed data requirements
- Review shared files in [team-ownership-matrix.md](/d:/memberflow-pro/docs/team-plans/team-ownership-matrix.md)

### Super Admin Dashboard Team

- Audit [src/SuperAdminDashboard.tsx](/d:/memberflow-pro/src/SuperAdminDashboard.tsx)
- Complete organization actions already surfaced in UI
- Add org-admin summary placeholder widgets
- Add payment summary placeholder widget fed from current backend

### Organization Admin Dashboard Team

- Audit [src/OrgAdminDashboard.tsx](/d:/memberflow-pro/src/OrgAdminDashboard.tsx)
- Replace settings placeholder with route-backed module
- Add summary cards using real org data where possible
- Add pending work and recent activity placeholders if backend is not ready

### Member Management Team

- Audit [src/AdminPanel.tsx](/d:/memberflow-pro/src/AdminPanel.tsx)
- Implement add member flow
- Add member role field handling
- Design import or export API contract with foundation team

### Event Management Team

- Audit [src/Events.tsx](/d:/memberflow-pro/src/Events.tsx)
- Add edit and delete controls
- Add event status refinement
- Define attendee data shape with foundation team

### Blog and Announcements Team

- Audit [src/Blogs.tsx](/d:/memberflow-pro/src/Blogs.tsx)
- Add edit and delete actions
- Replace `isPublic` simplification with draft or published plan
- Define category and status filter shape

### Payments and Subscriptions Team

- Audit [src/Payments.tsx](/d:/memberflow-pro/src/Payments.tsx)
- Separate payment history from subscription management concerns
- Define invoice, receipt, and plan entity requirements with foundation team
- Add placeholder tabs if the final model is not yet ready

### Settings, Profile, and Security Team

- Audit [src/Profile.tsx](/d:/memberflow-pro/src/Profile.tsx)
- Audit config and OTP endpoints in [server/routes/misc.routes.ts](/d:/memberflow-pro/server/routes/misc.routes.ts)
- Build secure password-change design
- verify that no sensitive values are exposed

### Public Experience Team

- Audit [src/LandingPage.tsx](/d:/memberflow-pro/src/LandingPage.tsx)
- Define public event registration flow with event team
- Keep Sprint 1 limited to feed quality and route design, not full redesign

## Sprint 1 Exit Criteria

- Foundation contracts published
- Team ownership accepted
- No team is blocked by undefined statuses or route ownership
- Super admin and org admin dashboard directions are stable
- Members, events, blogs, and payments teams each complete one meaningful enhancement on top of existing code
