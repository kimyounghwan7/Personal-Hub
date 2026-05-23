# Copilot Instructions

## Build, test, and lint commands

- Full stack local dev: `docker compose up --build`
- Backend install and run:
  - `cd backend && python3 -m pip install -r requirements.txt`
  - `cd backend && alembic upgrade head`
  - `cd backend && uvicorn app.main:app --reload --port 8000`
- Backend tests:
  - Full suite: `cd backend && pytest tests/`
  - Single file: `cd backend && pytest tests/test_security.py`
  - Single test: `cd backend && pytest tests/test_security.py::test_get_current_user_id_uses_fallback_only_when_enabled`
  - Keyword filter: `cd backend && pytest tests/ -k fallback`
  - If the Docker stack is already running, prefer container-first execution: `docker exec to-do-backendapp-backend-1 python -m pytest tests/test_security.py::test_get_current_user_id_uses_fallback_only_when_enabled`
- Frontend install, lint, and build:
  - `cd frontend && npm install`
  - `cd frontend && npm run dev`
  - `cd frontend && npm run lint`
  - If the Docker stack is already running: `docker exec to-do-backendapp-frontend-1 npm run lint`
  - `cd frontend && npm run build && npm run start`
- Quick running-stack checks:
  - Backend docs: `curl -I http://localhost:8000/docs`
  - Frontend: `curl -I http://localhost:3000`

Backend settings are instantiated at import time from the repository root `.env`. For local pytest runs, make sure `SUPABASE_JWT_SECRET` is a real value or set `ENVIRONMENT=local`/`development`; otherwise settings validation can fail during test collection.

## High-level architecture

- This is a monorepo with a Next.js 14 App Router frontend in `frontend/` and a FastAPI backend in `backend/`. `docker-compose.yml` runs the frontend on port 3000 and the backend on port 8000.
- The backend follows a layered structure: `app/main.py` wires the API, `app/api/v1/endpoints/*` contains thin route handlers, `app/services/*` holds business logic, `app/models/*` defines SQLAlchemy models, and `app/schemas/*` defines Pydantic request/response models.
- Authentication spans both apps. The frontend signs users in with Supabase JS, and `frontend/src/lib/api.ts` adds the current Supabase access token to every Axios request. The backend verifies that bearer token in `app/core/security.py`, provisions or updates the matching `Profiles` row through `AuthService.sync_profile`, then enforces approval and admin checks before allowing access to todos or admin routes.
- The main backend resources are `Profiles` and `Todos`. Todo queries are always scoped by the authenticated `user_id`, while admin endpoints manage approval and deletion of user profiles.
- Startup and migrations have project-specific behavior: `ADMIN_EMAIL` can auto-promote an existing profile to admin during FastAPI startup, and Alembic reads the actual database URL from application settings in `backend/alembic/env.py` instead of relying on `alembic.ini`.
- On the frontend, the shared layout and navbar live under `src/app/layout.tsx` and `src/components/Navbar.tsx`, while `/todos` and `/admin` are client-rendered pages that perform session-aware fetches against the backend API.

## Key conventions

- Keep all API routes under `/api/v1/*`.
- Keep route modules thin and move business logic into `backend/app/services`.
- Scope non-admin database access by `user_id`; backend authorization is the source of truth.
- Preserve the profile-sync flow: after email/password login or OAuth, frontend code should call `POST /api/v1/auth/profile-sync` before depending on profile state such as approval or role.
- The backend only allows Supabase API fallback token validation when `ENVIRONMENT` is `local` or `development` **and** `ALLOW_SUPABASE_AUTH_FALLBACK=true`. Outside local development, JWTs are expected to validate locally with `SUPABASE_JWT_SECRET`.
- Database config and migrations assume Supabase Session Pooler-style URLs and avoid `alembic.ini` interpolation issues with special characters in passwords by using `settings.DATABASE_URL` directly in `backend/alembic/env.py`.
- The SQLAlchemy models use capitalized table names (`Profiles`, `Todos`); preserve that naming in migrations and foreign keys.
- Frontend API calls should go through `frontend/src/lib/api.ts` so auth headers stay consistent.
- `frontend/src/middleware.ts` only adds security headers; it is not the primary auth gate for protected pages.
- When containers are already running, prefer the container-first validation commands documented in `.github/instructions/testing.instructions.md`.
