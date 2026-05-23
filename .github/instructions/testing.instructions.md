---
description: "Use when writing or updating tests, validating feature changes, or reviewing test coverage for backend or frontend work. Covers repository test expectations and validation workflow."
---

# Testing Instructions

- Treat tests as part of the implementation for behavior changes.
- Backend tests use `pytest` under `backend/tests/` with `test_*.py` naming.
- Frontend tests, when added, should use a modern component-testing stack consistent with the repo direction.
- Prefer focused tests for service logic, endpoint behavior, auth gating, and important UI states.
- Prefer validating against the running Docker containers when they are available.
- Current container targets:
	- Backend: `to-do-backendapp-backend-1`
	- Frontend: `to-do-backendapp-frontend-1`
- Container-first validation examples:
	- `docker exec to-do-backendapp-backend-1 python -m pytest tests/...`
	- `docker exec to-do-backendapp-backend-1 curl -i http://localhost:8000/...`
	- `docker exec to-do-backendapp-frontend-1 npm run lint`
	- `curl -I http://localhost:3000`
- When practical, run the relevant tests and report what was executed versus what was not.
