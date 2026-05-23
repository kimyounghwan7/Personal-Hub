---
description: "Use when editing FastAPI, SQLAlchemy, Alembic, auth, RBAC, or backend tests. Enforces layered architecture, user scoping, and migration safety."
applyTo: "backend/**/*"
---

# Backend Implementation Instructions

- Keep route handlers thin and move business logic to `backend/app/services`.
- Enforce auth and RBAC through dependencies in `backend/app/core/security.py`.
- Scope all user data access by `user_id`.
- Keep endpoints under `/api/v1/*`.
- For schema changes, use Alembic migrations and keep `alembic.ini` URL as placeholder.
- Prefer Session Pooler in `DATABASE_URL` and URL-encode special password characters.
- Add or update tests under `backend/tests` for behavior changes.
