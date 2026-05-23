---
description: "Use when editing Next.js App Router pages, middleware, auth UX, or shared API client code. Enforces route structure, session safety, and UI reliability."
applyTo: "frontend/**/*"
---

# Frontend Implementation Instructions

- Preserve route and layout conventions under `frontend/src/app`.
- Use shared API communication through `frontend/src/lib/api.ts`.
- Keep middleware and page-level auth checks consistent.
- Avoid trust-on-cookie-only patterns for sensitive protection logic.
- Maintain responsive behavior and include loading/error states.
- Keep changes small and aligned with existing component patterns.
