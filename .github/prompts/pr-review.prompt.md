---
name: "Project PR Review"
description: "Review a PR for regressions, auth/security risks, and missing tests using this repository's standards."
argument-hint: "PR summary, touched files, and what to focus on"
---

Review the proposed change with this order of priority:

1. Bugs, behavioral regressions, and security risks.
2. Auth and RBAC correctness.
3. Data isolation correctness (`user_id` scoping).
4. Migration and deployment safety.
5. Missing or weak tests.

Repository-specific checks:
- Backend layering remains clean: endpoints thin, service logic in `backend/app/services`.
- API path versioning remains under `/api/v1/*`.
- Admin-only behavior is actually enforced by backend dependencies.
- Frontend auth gating does not replace backend authorization.
- Supabase and DB config usage does not leak secrets or break local/dev setup.

Output format requirements:
- Findings first, ordered by severity.
- Include file references for each finding.
- State open questions/assumptions.
- End with a short change summary and test-gap summary.
