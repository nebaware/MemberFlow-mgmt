# Platform Contracts

## Entity Map
- Organization: `id`, `name`, `slug`, `status`, `description`, `config.customAttributeDefinitions`
- User: `uid`, `orgId`, `role`, `status`, `fullName`, `email`, `phoneNumber`, `profilePhotoUrl`
- Event: `id`, `orgId`, `title`, `description`, `date`, `location`, `capacity`, `status`, `attendees[]`
- Blog Post: `id`, `orgId`, `authorId`, `title`, `content`, `category`, `status`, `publishedAt`
- Payment: `id`, `memberId`, `orgId`, `type`, `method`, `amount`, `status`, `invoiceId`, `receiptId`
- Subscription Plan: `id`, `orgId`, `name`, `amount`, `interval`, `status`
- Audit Log: `id`, `timestamp`, `actorUid`, `actorRole`, `orgId`, `action`, `entityType`, `entityId`, `details`

## Permission Matrix
- `super_admin`: Global CRUD for organizations, members, events, blogs, payments, subscriptions, and logs.
- `org_admin`: CRUD inside own organization for members, events, blogs, payments, subscriptions, config.
- `member`: Own profile, own payments, event registration, member-view content.

## Response Contract
- Success envelope where useful: `{ success: true, ...payload }`
- Error envelope: `{ error: string }` with HTTP status code.
- List endpoints return arrays and accept optional `q`, `status`, and module-specific filters.

## Shared Status Enums
- Member status: `pending | active | suspended | rejected`
- Organization status: `active | suspended`
- Event status: `draft | published | cancelled`
- Blog status: `draft | published | archived`
- Payment status: `pending | completed | failed | cancelled`
- Subscription status: `active | paused | cancelled`

## Audit Coverage
- Mutations for organizations, members, events, blogs, payments, subscriptions, config, password changes, and profile photo updates create audit entries.
- System log API for super admins reads from the audit log stream.
