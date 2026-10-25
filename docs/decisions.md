# decisions — 확정된 결정

2026-10-25 · 상태: **현행** · 관련: [status](status.md) · [docs 색인](README.md)

**확정된 결정만 둔다.** 후보 · 미결 사항은 git 밖 `drafts/decision-candidates.md` 에 두고, 사용자가 확정하면 여기로 옮긴다(결정 WF-5).

## 분류 기호

- `WF-*` (Workflow): AI 에이전트 작업 흐름 · 문서 · 커밋 · 리뷰어 게이트 규칙
- `CS-*` (Cost & Security): 클라우드 과금 폭탄 방지 · 인증/인가 · 비밀키 격리 규칙
- `ARCH-*` (Architecture): 프론트엔드 · 백엔드 · 데이터베이스 구조 결정

---

## AI 작업 흐름 결정 (`WF-*`, 2026-10-25)

`SLUDemo` 레포지토리에서 검증된 에이전트 워크플로우 중 본 프로젝트에 필요한 핵심 규칙을 이식했다([워크플로우 이식 보고서](reports/2026-10-25_workflow-migration-from-sludemo.md)).

| id | 결정 내용 | 근거 | 결정일 | 상태 |
|---|---|---|---|---|
| **WF-1** | 루트 `CLAUDE.md` 는 200줄 이하의 지도로 유지하고, 현재 상태는 `docs/status.md`, 결정은 `docs/decisions.md`, 절차는 `docs/runbooks/`, 교훈은 `docs/lessons/` 에 둔다 | 지침 파일이 길어지면 상태와 규칙이 섞여 세션마다 판단이 흔들린다 | 2026-10-25 | decided |
| **WF-2** | `AGENTS.md` 는 `@[...]` 참조만 두어 Claude Code 와 Antigravity(`agy`)가 `.claude/rules/*.md` 와 `.claude/agents/*.md` 단일 정본을 복제 없이 함께 읽는다 | 두 도구용 규칙 파일을 따로 두면 수정할 때 한쪽이 누락되어 충돌한다 | 2026-10-25 | decided |
| **WF-3** | 보호 브랜치(`main`) 직접 push 제한 및 작업 성격별 분리 커밋(`git add -A` 금지: 코드 / 테스트·린트 / 문서 분리)을 `.claude/hooks/git-policy.sh` 로 강제한다 | 한 커밋에 코드와 문서를 섞으면 문제 발생 시 원인 파악과 롤백이 불가능하다 | 2026-10-25 | decided |
| **WF-4** | 파괴적 명령(`rm -r`, `mv`, 덮어쓰기 `cp`, `git rm`, `git checkout --`)은 다른 명령과 한 줄(`&&`, `;`)로 묶지 않고 단독 실행하며 `.claude/hooks/destructive-guard.sh` 로 차단한다 | 승인 거부나 중간 실패 시 앞단 명령만 실행되어 산출물을 잃는 사고를 막는다 | 2026-10-25 | decided |
| **WF-5** | 미정 초안 · 선택지 · 결정 후보는 git 무시 폴더 `drafts/` 에 두고, 확정된 것만 `docs/` 에 올린다. 커밋 전 `tools/docs_check.py` 로 링크 · 색인 · 머리 · Mermaid 렌더 · 결정 번호를 자동 검사한다 | 확정되지 않은 계획이 정본 문서에 섞이면 다음 세션이 확정된 지시로 오인한다 | 2026-10-25 | decided |
| **WF-6** | 린트 · 포매터 · 보안 검사 규칙을 임의로 끄거나 완화(`noqa`, `eslint-disable` 등)하지 않으며, 변경이 필요하면 항목별로 이유와 영향을 먼저 보고해 승인받는다 | 에이전트가 검사를 통과하려고 규칙을 끄면 결함이 조용히 숨겨진다 | 2026-10-25 | decided |
| **WF-7** | 본문이 다른 함수 호출 하나뿐인 단순 감싸기(래퍼) 함수를 늘리지 않으며, 편집 직후 `.claude/hooks/shape-guard.sh`(`tools/shape_guard.py`)로 검사한다 | 과도한 래퍼 함수 파편화는 코드 가독성과 추적성을 떨어뜨린다 | 2026-10-25 | decided |
| **WF-8** | 단계 완료 시 `code-reviewer` · `auth-security-reviewer` · `docs-reviewer` · `verifier` 서브에이전트로 검증하며, 리뷰어는 최대 2회차까지만 수정 확인하고 3회차 이상은 STOP 한다 | 무한 리뷰 루프로 인한 턴 지연을 막으면서 치명적 보안·품질 결함만 정확히 잡는다 | 2026-10-25 | decided |
| **WF-9** | 구현 에이전트를 모델별로 분리해 백엔드는 **Gemini 4 Argon** 기반 `backend-dev`(`Model="inherit"`), 프론트엔드는 **Gemini 3.8 Flash** 기반 `frontend-dev`(`Model="flash"`), 단독 HTML 디자인 목업은 **Gemini 3.8 Flash** 기반 `html-mockup-writer`(`Model="flash"`)에 맡기며, 백엔드/DB 규칙 승격 시 `test_architecture_harness.py` + Red-check 를 동반한다 | 보안·트랜잭션·스키마 정합성이 중요한 백엔드는 상위 추론 모델(Argon)로 엄격히 다루고, UI 컴포넌트와 단독 HTML 목업은 경량 고속 모델(Flash 3.8)로 빠르게 처리해 속도와 비용 효율을 함께 높인다 | 2026-10-25 | decided |

---

## 비용 안전 및 보안 결정 (`CS-*`, 2026-10-25)

| id | 결정 내용 | 근거 | 결정일 | 상태 |
|---|---|---|---|---|
| **CS-1** | 프론트엔드(Vercel Hobby 무료) · DB(Supabase Free 또는 Spend Cap 활성) · 백엔드(단일 고정 인스턴스, Auto-scaling 비활성)로 **지출 상한(Hard Cap) 구조**를 강제한다 | 트래픽 급증이나 무한 루프 버그 시 서버가 일시 지연/정지될지언정 과금 폭탄이 절대 발생하지 않게 한다 | 2026-10-25 | decided |
| **CS-2** | 도메인 연결 시 Cloudflare 무료 DNS Proxy(WAF)를 앞단에 두어 DDoS 방어 및 `/api/*` 경로 Rate Limiting 을 서버 도달 전에 적용한다 | 공격 트래픽이 백엔드 컨테이너와 DB 커넥션을 직접 소모하는 것을 막는다 | 2026-10-25 | decided |
| **CS-3** | 모든 백엔드 입력 스키마 문자열 필드에 `max_length` 상한을 두고 목록 조회 쿼리에 건수 상한을 둔다 | 대용량 페이로드 주입으로 인한 DB 용량(500MB 한도) 및 메모리 고갈을 차단한다 | 2026-10-25 | decided |
| **CS-4** | 백엔드 인증은 `SUPABASE_JWT_SECRET` 로컬 서명/클레임 검증을 사용하고, 프로덕션(`ENVIRONMENT=production`)에서는 외부 Supabase Auth API Fallback(`ALLOW_SUPABASE_AUTH_FALLBACK=False`)을 엄격히 금지한다 | 매 요청마다 외부 Auth API 를 호출하면 지연 시간 증가와 위조 토큰 공격 시 API 한도 소진이 발생한다 | 2026-10-25 | decided |

---

## 아키텍처 결정 (`ARCH-*`, 2026-10-25)

| id | 결정 내용 | 근거 | 결정일 | 상태 |
|---|---|---|---|---|
| **ARCH-1** | 신규 가입자는 DB 트리거와 `/api/v1/auth/profile-sync` 를 통해 기본 미승인(`is_approved=False`, `role='user'`)으로 생성하고, `ADMIN_EMAIL` 일치 계정만 자동 관리자 승격 및 승인 처리한다 | 개인 허브 특성상 허가되지 않은 외부 가입자가 임의로 데이터를 생성해 DB 자원을 쓰는 것을 막는다 | 2026-10-25 | decided |
| **ARCH-2** | 백엔드 DB 연결은 IPv4 호환 및 커넥션 풀링을 지원하는 Supabase Session Pooler(포트 `6543`)를 기본으로 사용한다 | 로컬 Docker 및 IPv4 전용 컨테이너 호스팅 환경에서의 연결 실패와 커넥션 고갈을 함께 방지한다 | 2026-10-25 | decided |
| **ARCH-3** | 백엔드 컨테이너 배포 플랫폼은 **Render**(Free 또는 Starter 고정형 단일 인스턴스, Auto-scaling 비활성)로 확정한다 | GitHub 연동 배포가 단순하고 무제한 종량제 오토스케일링이 없어 과금 폭탄 위험을 원천 차단할 수 있다 | 2026-10-25 | decided |
| **ARCH-4** | 프론트엔드 UI 는 배포 전에 **`shadcn/ui`**(Radix UI + Tailwind CSS 기반)를 도입하여 컴포넌트를 표준화하고 로컬 기능 점검을 마친 뒤 배포한다 | 일관된 다크 테마 디자인 토큰과 접근성이 검증된 부품(`Button`, `Input`, `Card`, `Badge`, `Table`, `Checkbox`)으로 화면 완성도를 높인 뒤 배포한다 | 2026-10-25 | decided |
| **ARCH-5** | To-Do + 캘린더 워크스페이스는 **Tone 3 무채색 화이트/슬레이트(`#F4F6F8` / `#FFFFFF` / `#E5E8EB`) 바탕에 진한 그린 Primary(`#18865B`) + 파스텔 그린 틴트(`#E6F4EE`)** 및 네이버페이 부동산(`fin.land.naver.com`) 스타일의 상단 알약형 필터 바 · 좌우 분할 도킹 패널 구조를 기본으로 하며, 백엔드는 멀티데이 일정(`started_on ~ due_date`), 카테고리(`VARCHAR + Literal`), 소프트 삭제 3종 세트(`S7`) 및 읽기/쓰기 분리(`todo_queries.py` / `todo_service.py`)를 채택한다 | 배경과 카드에서 녹색기를 완전히 빼 가독성을 높이고 버튼·일정 막대에만 선명한 그린과 파스텔 틴트를 집중시키며, `model-hub` 의 캘린더 Span Bar · 백엔드/DB 규칙(`P/R/C`, `S1~S8`)과 결합해 완성도를 높인다 | 2026-10-25 | decided |

