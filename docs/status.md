# status — 지금 어디까지 왔나

2026-10-25 · 상태: **현행** · 관련: [decisions](decisions.md) · [docs 색인](README.md) · [runbooks](runbooks/README.md) · [reports](reports/README.md)

**새 세션은 이 문서부터 읽는다.** 한 화면이 목표다 — 2절(지금 · 다음 · 정할 것)을 고치고, 이력에 한 줄을 더한다.

## 1. 목표와 단계

**목표**: Personal Hub(Next.js + FastAPI + Supabase) 웹서비스를 완성하고, **도메인 구매 · 실전 클라우드 배포 · 말도 안 되는 과금(비용 폭탄)이 절대 발생하지 않는 방어 구조와 위험 지점 학습 체계**를 구축한다.

```mermaid
flowchart LR
    A["1단계: 프로젝트 점검 및<br/>SLUDemo 형 워크플로우 이식"] --> B["2단계: 코드 위험 지점 보강 및<br/>미완성 기능(To-Do/스키마/CSP) 수정"]
    B --> C["3단계: shadcn/ui 도입 및<br/>빌드·린트·기능 점검"]
    C --> D["4단계: Render · Vercel 배포 및<br/>도메인 · Cloudflare WAF 연결"]
    style A fill:#1f6f3f,stroke:#3fb950,color:#ffffff
    style B fill:#1f6f3f,stroke:#3fb950,color:#ffffff
    style C fill:#1f6f3f,stroke:#3fb950,color:#ffffff
    style D fill:#7a5a00,stroke:#d29922,color:#ffffff
```

| 단계 | 상태 | 어디까지 |
|---|---|---|
| 1 프로젝트 점검 · 워크플로우 이식 | **끝**(2026-10-25) | 코드 정적 점검 · Mermaid 아키텍처 및 5대 과금 위험 지점 분석([보고서](reports/2026-10-25_project-inspection-and-cost-architecture.md)) · `SLUDemo` 방식 거버넌스 이식 완료 |
| 2 코드 위험 지점 · 기능 보강 | **끝**(2026-10-25) | `due_date` 타입(`Optional[datetime]`) 일치 · 입력 상한(`max_length`, `MAX_TODOS_PER_USER=500`, CS-3) · DB 커넥션 풀 상한 · 관리자 삭제 예외 은닉 · CSP 동적 허용 · To-Do 완료(`PUT`)/삭제(`DELETE`) 연결 · `pytest` 30개 통과 |
| 3 `shadcn/ui` 도입 · 빌드/린트 점검 | **끝**(2026-10-25) | 프론트엔드 `shadcn/ui` 설정(`components.json`, `lib/utils.ts`, CSS 변수 토큰) 및 7종 부품(`button`, `input`, `card`, `badge`, `table`, `checkbox`, `label`) 전 화면 적용 · `npm run lint` · `tsc --noEmit` · `next build` 통과 |
| 4 Render · Vercel 배포 · 도메인 연결 | **대기 (다음 단계)** | 백엔드 Render 배포 확정(ARCH-3) · 도메인 시장조사 완료([도메인 비교 보고서](reports/2026-10-25_domain-market-research.md)) → 로컬 브라우저 최종 눈 확인 후 배포 및 Cloudflare WAF 연결([런북](runbooks/cost-safe-deployment.md)) |

## 2. 지금 · 다음 · 정할 것

**지금(2026-10-25)**:
- **3단계(`shadcn/ui` 도입 및 프론트엔드 전체 화면 적용·검증)** 를 완료했다(결정 ARCH-4):
  - `frontend/components.json` · `frontend/src/lib/utils.ts` · `frontend/tailwind.config.ts` · `frontend/src/app/globals.css`: 다크 글래스모피즘 테마와 호환되는 `shadcn/ui` 디자인 토큰 설정 완료.
  - `frontend/src/components/ui/`: `button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`, `table.tsx`, `checkbox.tsx`, `label.tsx` 7종 컴포넌트 구현.
  - 화면 리팩토링: 랜딩(`app/page.tsx`), 내비게이션(`Navbar.tsx`), 로그인/회원가입(`LoginPageClient.tsx`), 투두/캘린더(`TodosPageClient.tsx`, `CalendarView.tsx`), 관리자 대시보드(`AdminDashboardClient.tsx`) 전체를 `shadcn/ui` 부품으로 교체 완료.
  - 검증: `npm run lint` (`✔ No ESLint warnings or errors`), `npx tsc --noEmit` (`rc=0`), `npm run build` (정적/동적 라우트 전체 프로덕션 빌드 성공, `rc=0`).

**다음 할 것 (로컬 웹 UI 실제 확인 및 4단계 배포 진입)**:
1. 로컬에서 프론트엔드(`http://localhost:3000`)와 백엔드(`http://localhost:8000`)를 띄워 실제 웹 화면 퀄리티와 동작을 브라우저에서 확인한다.
2. 확인 후 [과금 폭탄 방지 배포 런북](runbooks/cost-safe-deployment.md)에 따라 Render(백엔드, 결정 ARCH-3) + Vercel Hobby(프론트엔드) 배포 및 도메인 연결로 넘어간다.

**지금 정해야 할 것 (사용자 확인 사항)**:
1. **로컬 개발 서버 구동 확인**: 브라우저(`http://localhost:3000`)에서 바로 웹 퀄리티를 확인하실 수 있도록 백엔드(`uvicorn`)와 프론트엔드(`npm run dev`) 로컬 서버를 지금 띄워 드릴까요? (아래 안내된 명령으로 직접 실행하셔도 됩니다.)
2. **도메인 선택**: 로컬 웹 퀄리티 확인 후 배포할 때 사용할 도메인 확장자(`.com` / `.dev` vs `.kr`)와 대행사([도메인 시장조사 보고서](reports/2026-10-25_domain-market-research.md) 참고)를 정해주시면 됩니다.

## 3. 열린 문제 (해결 현황)

| 문제 | 위치 | 상태 |
|---|---|---|
| `due_date` 타입 불일치 (`date` vs ISO `datetime`) | `backend/app/schemas/todo.py`, `frontend/src/components/TodosPageClient.tsx` | **해결 완료**(2026-10-25, `Optional[datetime]` 통일 및 단위 시험 검증) |
| To-Do 완료 체크(`readOnly`) 및 삭제 버튼 미구현 | `frontend/src/components/TodosPageClient.tsx` | **해결 완료**(2026-10-25, `shadcn/ui` `Checkbox` · `Button` 으로 `PUT`/`DELETE` 연결) |
| 프로덕션 CSP `connect-src` 외부 백엔드 도메인 차단 | `frontend/next.config.mjs` | **해결 완료**(2026-10-25, `NEXT_PUBLIC_API_URL` origin 동적 추가) |
| API 입력 길이(`max_length`) 및 조회 `limit` 미설정 | `backend/app/schemas/todo.py`, `backend/app/services/todo_service.py` | **해결 완료**(2026-10-25, `Field(max_length=...)` 및 `MAX_TODOS_PER_USER=500` 적용) |
| 로컬 `frontend/node_modules` 및 ESLint/빌드 검증 | `frontend/` | **해결 완료**(2026-10-25, 의존성 설치 · `.eslintrc.json` 구성 · `npm run lint` 및 `next build` 통과) |

## 4. 이력

| 날짜 | 한 일 | 문서 |
|---|---|---|
| 2026-10-25 | 3단계 완료 — `shadcn/ui` 7종 컴포넌트(`Button`, `Input`, `Card`, `Badge`, `Table`, `Checkbox`, `Label`) 도입 및 전체 화면 리팩토링, `npm run lint` · `tsc` · `next build` 통과 | [decisions (ARCH-4)](decisions.md) |
| 2026-10-25 | 백엔드 배포 플랫폼 Render 확정(ARCH-3) · 배포 전 `shadcn/ui` 도입 및 기능 점검 확정(ARCH-4) · 도메인 확장자/대행사 시장조사 보고서 작성 | [도메인 시장조사 보고서](reports/2026-10-25_domain-market-research.md) · [decisions](decisions.md) |
| 2026-10-25 | 2단계 완료 — 백엔드 스키마(`due_date: datetime`, `max_length`)·서비스 상한(`MAX_TODOS_PER_USER=500`)·DB 풀 상한·예외 은닉 보강, 프론트엔드 CSP 동적 origin 허용 및 To-Do 완료/삭제 UI 연결, `pytest` 30개 통과 | [점검·아키텍처 보고서](reports/2026-10-25_project-inspection-and-cost-architecture.md) |
| 2026-10-25 | 1단계 완료 — 프로젝트 전체 정적 점검 · `shadcn/ui` 미도입 확인 · Mermaid 시스템 아키텍처 2종 및 과금 폭탄 5대 위험 지점 보고서 작성 · `SLUDemo` 에이전트 워크플로우 마이그레이션 완료 | [워크플로우 이식 보고서](reports/2026-10-25_workflow-migration-from-sludemo.md) |
