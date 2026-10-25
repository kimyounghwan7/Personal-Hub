# runbooks — 절차

2026-10-25 · 상태: **현행** · 관련: [docs 색인](../README.md) · [lessons](../lessons/README.md)

손으로 따라 하는 실행·배포·검증 절차를 둔다. 왜 그렇게 해야 하는지(위험 지점과 원리)는 [lessons](../lessons/README.md) 와 [보고서](../reports/README.md)에 있다.

| 문서 | 언제 |
|---|---|
| [local-dev-and-verify](local-dev-and-verify.md) | 로컬에서 환경변수를 세팅하고 백엔드/프론트엔드 실행 및 자동 검사(`docs_check`, `code_shape`, `pytest`, `lint`)를 돌릴 때 |
| [cost-safe-deployment](cost-safe-deployment.md) | 도메인을 구매해 Cloudflare · Vercel · Render/Fly.io · Supabase 에 과금 폭탄 없이 안전하게 배포할 때 |
