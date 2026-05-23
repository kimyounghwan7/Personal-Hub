# Backend Agents Guide

## Stack
- Python 3.10, FastAPI, SQLAlchemy, Pydantic v2, Alembic, Supabase/Postgres.

## Architecture Rules
- Keep endpoints in `app/api/v1/endpoints` thin.
- Place business logic in `app/services`.
- Keep ORM models in `app/models` and request/response schemas in `app/schemas`.
- Keep API versioning under `/api/v1/*`.

## Auth And RBAC
- Regular endpoints require authenticated users.
- Admin endpoints must enforce admin dependency checks.
- Never expose cross-user data; scope data access by `user_id`.
- Keep profile approval and admin bootstrap logic aligned with `ADMIN_EMAIL` behavior.

## DB And Migration Rules
- Prefer Supabase Session Pooler for local/dev reliability.
- Ensure special characters in `DATABASE_URL` password are URL-encoded.
- Keep `alembic.ini` URL as placeholder and resolve real URL in `backend/alembic/env.py` via settings.

## Validation
- For backend behavior changes, add or update tests in `backend/tests` when feasible.
- Before completion, run relevant commands from root `AGENTS.md` backend section.
