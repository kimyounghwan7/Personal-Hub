---
description: "Use when editing authentication, authorization, JWT validation, session handling, middleware protection, admin routes, or user data isolation. Covers backend-driven identity and auth safety rules."
applyTo: "backend/**/*,frontend/src/middleware.ts,frontend/src/lib/**/*,frontend/src/app/auth/**/*,frontend/src/app/admin/**/*,frontend/src/app/todos/**/*"
---

# Auth And Authorization Instructions

- Never trust frontend-only state for authorization; backend enforcement is the source of truth.
- Keep identity, role, and approval decisions on the backend.
- Prefer local JWT verification with the configured signing secret; any fallback path must be explicitly limited to local development.
- Keep user resource access scoped to the authenticated user identity.
- Preserve just-in-time profile creation rules and `ADMIN_EMAIL` auto-promotion behavior.
- Keep frontend auth flows aligned with protected backend endpoints and `/api/v1/*` routing.
- For auth-sensitive changes, run the `auth-security-review` agent before finalizing work.
