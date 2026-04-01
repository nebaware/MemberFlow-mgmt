# Settings, Profile, and Security Plan

## Mission

Build the account settings and organization profile area with secure editing flows and proper handling of credentials and sensitive data.

## Feature Objective

Replace unsafe profile editing patterns with proper security boundaries while still giving admins control over their profile and organization metadata.

## Core Features

- admin profile editing
- organization profile editing
- profile photo upload
- password change flow
- invitation email preference
- security notes and account actions

## Critical Security Rule

Passwords or password hashes must never be displayed in profile forms, API responses, logs, or seed UI.

## In Scope

- settings page
- edit profile form
- organization metadata form
- profile photo upload flow
- secure password change flow
- account audit visibility where appropriate

## Out of Scope

- Full identity federation
- advanced device session management in first release

## Backend Tasks

- `GET /api/account/profile`
- `PATCH /api/account/profile`
- `PATCH /api/account/organization-profile`
- `POST /api/account/change-password`
- `POST /api/account/profile-photo`

## Frontend Tasks

- settings screen
- profile form
- organization form
- secure password dialog
- upload component
- validation and error display

## QA Tasks

- Verify password values are never returned to UI
- Verify profile updates are scoped correctly
- Verify file upload validation
- Verify account changes are audited when required

## Definition of Done

- Admin users can safely update profile and organization details
- Credential handling follows production-safe practices
