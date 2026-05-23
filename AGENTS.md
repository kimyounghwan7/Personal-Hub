# Project Agents Guide

## Scope
- This root file defines shared defaults for the whole monorepo.
- Area-specific rules override this file:
  - `backend/AGENTS.md`
  - `frontend/AGENTS.md`

## Monorepo Defaults
- Keep changes focused and avoid broad refactors unless explicitly requested.
- Prefer read-only exploration before editing when the task is non-trivial.
- Link existing docs instead of duplicating long explanations.

## Build And Test Quick Commands
- Full stack:
  - `docker compose up --build`
- Backend:
  - `cd backend && python3 -m pip install -r requirements.txt`
  - `cd backend && uvicorn app.main:app --reload --port 8000`
  - `cd backend && alembic upgrade head`
  - `cd backend && pytest tests/`
- Frontend:
  - `cd frontend && npm install`
  - `cd frontend && npm run dev`
  - `cd frontend && npm run build && npm run start`
  - `cd frontend && npm run lint`

## Security Review Policy
- Any change touching authentication, authorization, token/session handling, middleware protection, admin checks, or user data isolation must include an auth security review.
- Run the custom agent `auth-security-review` for those changes and treat high-severity findings as blockers.
- Review output must include:
  - Findings ordered by severity with file references.
  - Missing tests and residual risks.

## Docs
- Setup and environment details: `README.md`
- Implementation roadmap: `implementation_plan.md`
- Active agent instructions:
  - `.github/instructions/backend.instructions.md`
  - `.github/instructions/frontend.instructions.md`
  - `.github/instructions/auth.instructions.md`
  - `.github/instructions/testing.instructions.md`
  - `.github/instructions/deployment.instructions.md`
- Active agents:
  - `.github/agents/auth-security-review.agent.md`
  - `.github/agents/release-guardian.agent.md`
- Active skills:
  - `.github/skills/full-stack-personal-hub-builder/SKILL.md`
  - `.github/skills/qa-automation-engineer/SKILL.md`
