---
name: full-stack-personal-hub-builder
description: "Build or extend this Next.js + FastAPI + Supabase application in phased steps. Use for full-stack feature implementation, project bootstrapping, DB planning, API integration, and deployment-oriented work."
argument-hint: "Describe the feature or build phase you want implemented"
user-invocable: true
---

# Full-Stack Personal Hub Builder

## When To Use
- Build a new vertical feature across frontend and backend.
- Plan schema, API, and UI changes together.
- Extend this monorepo while preserving its existing architecture.

## Procedure
1. Read the relevant workspace instructions in `.github/instructions/` for backend, frontend, auth, testing, and deployment as needed.
2. Explore existing patterns before editing.
3. Plan the feature by layer: schema, backend services/endpoints, frontend pages/components, and validation.
4. Implement incrementally instead of rewriting large areas at once.
5. Validate with the relevant test, lint, run, or container checks.

## Project-Specific Requirements
- Keep backend handlers thin and service-centric.
- Keep API routes versioned under `/api/v1/*`.
- Preserve backend-driven auth and user scoping.
- Reuse shared frontend API and auth patterns.
