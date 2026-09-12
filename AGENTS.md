# Naaguru — AI Agent Rules
## Graphify Usage

This repository uses Graphify as a codebase knowledge graph.

Before broad repository exploration:
1. Check graphify-out/ exists.
2. Use Graphify query/path/explain when investigating architecture or relationships.
3. Inspect only files relevant to the current task.
4. Do not create temporary Python investigation scripts inside graphify-out/.
5. Do not modify graphify-out manually.
6. Do not rebuild the graph from scratch when --update is sufficient.
7. Do not explore unrelated modules.

After completing a meaningful implementation task:
- run tests/build/typecheck
- update project state
- refresh Graphify when required

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


## Database Portability Requirement

PostgreSQL is the application database standard.

Supabase is currently used only as the initial PostgreSQL hosting/
infrastructure provider. Do not create application-level dependencies
that make the database schema or data dependent on Supabase.

All database design and implementation MUST remain portable to a
standard PostgreSQL server.

Requirements:

- Use standard PostgreSQL types and features where practical.
- Use Drizzle migrations as the canonical schema history.
- Keep all schema definitions in the repository.
- Keep migrations version-controlled.
- Keep seed scripts/data version-controlled and reproducible.
- Do not use Supabase-specific database APIs unless explicitly
  approved as a deliberate infrastructure decision.
- Do not use Supabase JS for normal backend database operations.
- Backend database access must continue through the existing Drizzle
  repository/infrastructure layer.
- Avoid provider-specific extensions unless there is a documented
  portability plan.
- Database connection configuration must come from DATABASE_URL.
- Never hard-code database hostnames, credentials, or provider details.
- Foreign keys, indexes, constraints, enums, timestamps, UUIDs, and
  other schema objects must be represented in the migration history.

MIGRATION REQUIREMENT

The application must be designed so that a future migration from
Supabase PostgreSQL to an independently hosted PostgreSQL server can
be performed using standard PostgreSQL backup/restore and the
version-controlled Drizzle migration history.

Before introducing any provider-specific database feature, explicitly
evaluate its impact on future PostgreSQL portability.

The application code must not need to change merely because the
PostgreSQL hosting provider changes, except for infrastructure/
connection configuration.

For every database-related feature, preserve:

1. Schema portability
2. Data portability
3. Migration reproducibility
4. Backup/restore capability
5. Referential integrity
6. Indexes and constraints
7. Version history

<!-- END:nextjs-agent-rules -->
