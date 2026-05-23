# Frontend Agents Guide

## Stack
- Next.js App Router (TypeScript), Tailwind CSS, Supabase client auth.

## Structure Rules
- Preserve route patterns under `src/app`.
- Reuse shared API client patterns in `src/lib/api.ts`.
- Keep auth/session logic consistent between page guards and middleware.

## Auth And Session Rules
- Do not rely only on cookie presence for sensitive access decisions.
- Backend authorization remains source of truth; frontend checks are defense-in-depth.
- Prefer validated claims/session checks for protected server-side paths.

## UI And Reliability
- Keep responsive behavior for mobile and desktop.
- Maintain current visual language unless a redesign is requested.
- Include loading/error states for auth-dependent screens.

## Validation
- Run lint before completion for frontend-focused changes.
