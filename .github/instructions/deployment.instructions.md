---
description: "Use when editing Docker, deployment config, environment variables, CORS, or release setup. Covers frontend hosting, backend hosting, and deployment safety checks."
---

# Deployment Instructions

- Frontend deployment standard is Vercel-compatible Next.js output.
- Backend deployment standard is containerized FastAPI with the existing Docker-based flow.
- Keep environment variable assumptions explicit and avoid hardcoded secrets.
- When deployment URLs change, verify backend CORS/frontend URL settings remain aligned.
- Treat migration safety and startup command correctness as release blockers.
