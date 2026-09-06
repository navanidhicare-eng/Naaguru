# Naaguru — AI Agent Rules

## Rule 1 — Do not over-engineer
Prefer the simplest implementation that correctly solves the requirement.

## Rule 2 — Do not invent requirements
If a requirement is unclear and the decision materially affects architecture, ask before implementing. For small implementation details, make a reasonable decision and document it.

## Rule 3 — Do not add dependencies unnecessarily
Before adding a package, determine whether it is genuinely needed, if an existing dependency already solves the problem, or if the functionality can reasonably be implemented without it.

## Rule 4 — Protect module boundaries
Do not import another module's internal implementation. Use public interfaces.

## Rule 5 — Business logic should not live inside UI components
React components should primarily handle presentation and interaction. Important business rules belong inside the appropriate module.

## Rule 6 — Validate external input
Validate API input, forms, URL parameters, database input, and user-controlled data.

## Rule 7 — Handle errors deliberately
Do not silently swallow errors. Use consistent application-level error handling.

## Rule 8 — Security first
Never expose secrets, private database credentials, admin-only operations, or sensitive user information. Never trust the client for authorization.

## Rule 9 — Keep code understandable
The primary developer is a student learning the stack. Prefer readable code over clever code. Avoid unnecessary design patterns, generic abstractions, factories, dependency injection frameworks, deep inheritance, or excessive interfaces.

## Rule 10 — Vertical Slices
Implement in small vertical slices. Do not build huge features in one uncontrolled generation.

## Rule 11 — Testing
Do not attempt 100% test coverage. Prioritize tests for business rules, assessment scoring, matching logic, authorization, important validation, and critical database operations.

## Rule 12 — Communication Protocol
Before making a significant architectural change, explain:
- What are we changing?
- Why?
- Which module owns it?
- What files will change?
- Are there database/security implications?

After implementation, report:
- Implemented features
- Files changed
- Tests added/run
- How to verify

## Rule 13 — Learning Mode
When introducing an important concept, briefly explain:
- WHAT it is
- WHY we need it
- WHERE it belongs
Use labels:
🟢 **LEARN** — Developer should understand this properly.
🟡 **UNDERSTAND** — Explain the concept, but deep knowledge is not currently required.
🔴 **IMPLEMENT** — AI can handle most implementation; developer only needs to understand the purpose.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

# Infrastructure Portability

Supabase is an initial infrastructure/provider choice, not a permanent architectural dependency.

The application must remain portable to an independently managed PostgreSQL database.

## Database

PostgreSQL is the database technology.

Supabase currently provides the PostgreSQL infrastructure.

The application must not assume that Supabase will always host the database.

## Rules

- Keep business logic independent of Supabase.
- Keep database access behind repository/data-access boundaries.
- Prefer standard PostgreSQL features over unnecessary Supabase-specific database features.
- Do not scatter Supabase database calls throughout application/domain code.
- Do not make Supabase-specific functionality part of the domain layer.
- Database migrations should remain portable to standard PostgreSQL where reasonably possible.
- Authentication must be isolated behind the application's authentication boundary.
- Do not make Supabase RLS the sole authorization mechanism.
- Application-level authentication, RBAC, permissions, and resource authorization are the primary security mechanisms.
- PostgreSQL RLS may be used as additional defense-in-depth where appropriate.

## Future Migration

The intended migration path is:

Current:

Naaguru → Database Access Layer → Supabase PostgreSQL

Future:

Naaguru → Database Access Layer → Independently Managed PostgreSQL

The goal is to make this infrastructure migration possible without rewriting the business modules, API contracts, Flutter application, or core business logic.

<!-- END:nextjs-agent-rules -->
