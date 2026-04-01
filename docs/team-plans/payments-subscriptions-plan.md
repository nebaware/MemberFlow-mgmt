# Payments and Subscriptions Plan

## Mission

Build the organization subscription and payment operations module for manual payments, transfer records, plans, invoices, and receipts.

## Feature Objective

Support the administrative side of subscription billing so both org admins and super admins can track payment state clearly.

## Core Features

- plan listing
- create plan
- manual payment record
- transfer record
- billing interval display
- invoices tab
- receipts tab
- payment search
- payment status tracking

## In Scope

- subscription plan display
- organization subscription records
- manual payment entry
- transfer entry
- invoice and receipt placeholders or first release implementation
- super admin cross-org visibility
- org admin organization-only visibility

## Out of Scope

- Full external accounting integration
- Complex revenue recognition workflows

## Backend Tasks

- `GET /api/subscriptions`
- `POST /api/subscriptions/plans`
- `POST /api/subscriptions/payments/manual`
- `POST /api/subscriptions/payments/transfer`
- `GET /api/subscriptions/invoices`
- `GET /api/subscriptions/receipts`

## Frontend Tasks

- payment transactions table
- invoices and receipts tabs
- create plan action
- add payment dropdown
- manual payment modal
- transfer modal

## Data Rules

- payment records must have organization, plan, amount, method, actor, and timestamp
- invoices and receipts must trace back to payment or subscription records
- statuses should support at least `pending`, `paid`, `failed`, `refunded`

## QA Tasks

- Verify org scoping
- Verify plan filters and searches
- Verify invoice and receipt lookup
- Verify audit logging for financial changes

## Definition of Done

- Subscription and payment operations are visible and manageable in both admin contexts
- Financial actions are auditable and permission-protected
