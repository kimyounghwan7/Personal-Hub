# 비용 안전 및 보안 경계 규칙 — 모든 작업에 적용

이 프로젝트의 가장 큰 목적은 **도메인 연결 · 실제 배포 · 말도 안 되는 클라우드 과금(비용 폭탄) 원천 방지 및 위험 지점 학습**이다. 모든 코드와 인프라 설정은 아래 규칙을 따른다.

## 1. 과금 폭탄 방지 (Hard Cap & Bounded Resource)
- **무제한 종량제(Auto-scale Pay-as-you-go) 금지**: 트래픽이나 공격에 비례해 자동으로 인스턴스가 늘어나거나 지출 한도(Spend Cap) 없이 과금되는 구성을 쓰지 않는다(결정 CS-1).
  - Frontend: Vercel Hobby(무료, 초과 시 자동 일시 정지) 기준을 유지한다.
  - Database/Auth: Supabase Free(무료) 또는 Pro 사용 시 **Spend Cap 활성화**를 필수로 유지한다.
  - Backend: 단일 고정형 컨테이너(Render Free / 고정 Starter 1개 인스턴스 등)를 기준으로 하며, 오토스케일링을 켜지 않는다.
- **도메인 앞단 방어선(Cloudflare WAF / Rate Limit)**: 실제 도메인을 연결할 때는 Cloudflare DNS Proxy(주황색 구름)를 앞단에 두어 DDoS 방어와 경로별 Rate Limiting(`/api/*`)이 서버 도달 전에 작동하도록 구성한다(결정 CS-2).
- **API 입력 크기 및 조회 상한 강제**:
  - 모든 요청 스키마(`backend/app/schemas/`)의 문자열 필드는 `Field(max_length=...)` 로 최대 길이를 제한해 대용량 페이로드 공격을 막는다(결정 CS-3).
  - 목록 조회 쿼리(`backend/app/services/`)는 무제한 `.all()` 대신 상한(`limit`)을 두거나 사용자별 데이터 건수 상한을 둔다.
- **인증 검증 시 외부 네트워크 호출 금지**:
  - 매 API 요청마다 Supabase Auth 서버(`supabase.auth.get_user`)를 호출하면 지연 시간과 Auth 요청 한도가 소모된다.
  - 반드시 `SUPABASE_JWT_SECRET` 기반 로컬 JWT 서명/클레임 검증(`backend/app/core/security.py`)을 사용하고, 프로덕션(`ENVIRONMENT=production`)에서는 `ALLOW_SUPABASE_AUTH_FALLBACK=False` 를 유지한다(결정 CS-4).
- **DB 커넥션 고갈 방지**:
  - `DATABASE_URL` 은 IPv4 호환 및 커넥션 풀링을 제공하는 **Supabase Session Pooler(포트 6543)** 를 사용한다.
  - SQLAlchemy `create_engine` 은 무료/소규모 티어 커넥션 한도를 넘지 않도록 풀 크기를 제한한다.

## 2. 비밀키 및 권한 경계 (Auth & Secret Isolation)
- **비밀키(`SUPABASE_KEY` = `service_role`) 격리**:
  - `service_role` 키는 RLS(Row Level Security)를 우회하는 슈퍼 키다. 절대 프론트엔드 환경변수(`NEXT_PUBLIC_*`)나 클라이언트 코드, Git 저장소에 넣지 않는다.
  - 프론트엔드(Vercel)에는 공개 가능한 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` 만 둔다.
- **백엔드 단일 진실 공급원(Source of Truth)**:
  - 프론트엔드 미들웨어(`middleware.ts`)와 서버 컴포넌트 가드(`getServerUser`, `getServerProfile`)는 사용자 경험 및 1차 방어선일 뿐이다.
  - 모든 권한(`is_approved`, `role == "admin"`)과 데이터 격리(`Todo.user_id == profile.id`)는 반드시 백엔드 의존성(`get_current_approved_profile`, `get_current_admin_profile`)과 서비스 쿼리에서 강제한다.
- **보안 사고 대응**: 토큰 · 비밀번호 · 키 노출 발견 시 즉시 위치와 영향 범위를 자세히 보고하고, 교체 · 폐기 여부는 사용자가 결정한다.
