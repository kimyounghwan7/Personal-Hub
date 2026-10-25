# Personal Hub 프로젝트 구현 계획

"개인 홈페이지 프로젝트 계획서 (비용 최적화)" 문서를 바탕으로 Personal Hub(개인 포트폴리오 및 생산성 허브) 구축을 위한 구체적인 구현 계획입니다. Next.js, FastAPI, Supabase를 활용하여 월 5만 원 이하의 비용으로 운영할 수 있도록 구성합니다.

## User Review Required

> [!IMPORTANT]
> 백엔드 배포 플랫폼(Render vs Fly.io) 결정이 필요합니다. 
> - **Render**: 설정이 간편하고 GitHub 연동이 매우 쉬우나, 무료 티어의 경우 일정 시간 미사용 시 Cold Start(초기 접속 지연)가 발생할 수 있습니다.
> - **Fly.io**: 배포 과정이 Render에 비해 약간의 터미널 작업이 필요할 수 있으나, 무료 티어 자원이 비교적 넉넉합니다.
> 둘 중 어떤 플랫폼을 선호하시나요? (현재 계획에서는 상대적으로 설정이 간단한 Render를 기본으로 가정했습니다.)

> [!NOTE]
> 커스텀 도메인 연동은 Vercel 및 Render 배포 이후 추가 설정이 필요합니다. 초기 개발 단계에서는 플랫폼에서 제공하는 기본 도메인(예: `.vercel.app`, `.onrender.com`)을 우선 사용하고, 배포가 안정화된 이후 커스텀 도메인을 연결하는 방향으로 진행하는 것이 좋은데 괜찮으신가요?

## Open Questions

1. **로컬 Supabase 환경 구축 여부:** 계획서상 마일스톤 1단계에 `docker-compose.yml로 프론트/백/Supabase(로컬) 환경 통일`이 있습니다. 로컬 Supabase(Supabase CLI)의 경우 초기 설정이 다소 복잡하고 로컬 PC의 자원(RAM 등)을 꽤 소모하는 편입니다. 처음부터 **클라우드 Supabase Free 티어**를 이용해 클라우드 DB를 로컬에서 연동하여 개발하는 것으로 대체하는 것은 어떨까요?
2. **UI/UX 디자인:** Frontend(Next.js) 개발 시 빠르고 모던한 스타일링을 위해 **Tailwind CSS**를 기본적으로 사용하는 것이 좋을까요? (생산성 툴과 캘린더 등 깔끔한 UI를 위해 추천드립니다.)

## Proposed Changes

### 1. 인프라 및 로컬 환경 설정 (Infrastructure)

#### [NEW] `docker-compose.yml` (선택적)
- Frontend(Next.js)와 Backend(FastAPI) 로컬 개발 환경 컨테이너화 구성

#### [NEW] `.env` 및 `.env.example`
- 프론트엔드 및 백엔드에서 공통으로 참조할 환경변수 (Supabase URL, API Keys 등) 템플릿

### 2. Backend (FastAPI)

#### [NEW] `backend/main.py`
- FastAPI 애플리케이션 진입점 (CORS 미들웨어 설정, 라우터 등록)

#### [NEW] `backend/requirements.txt`
- 의존성 패키지 목록 (`fastapi`, `uvicorn`, `supabase`, `pydantic` 등)

#### [NEW] `backend/Dockerfile`
- Render (또는 Fly.io) 배포를 위한 도커 이미지 빌드 파일

#### [NEW] `backend/routers/todos.py`
- Todo CRUD (생성, 조회, 수정, 삭제) API 엔드포인트 구현

#### [NEW] `backend/database.py`
- Supabase 클라이언트 연결 객체 생성 및 관리

### 3. Database (Supabase 클라우드)

#### [NEW] Supabase 클라우드 프로젝트 세팅
- `Profiles` 테이블 생성
- `Todos` 테이블 생성 (id, user_id, title, description, status, due_date, priority)
- Row Level Security (RLS) 정책 설정: 사용자 인증 기반으로 본인의 Todo만 접근(조회/수정/삭제) 가능하도록 구성

### 4. Frontend (Next.js)

#### [NEW] `frontend/package.json`
- Next.js 기반 프로젝트 세팅 (Next 14+ App Router, Tailwind CSS 적용)

#### [NEW] `frontend/src/app/page.tsx`
- 메인 페이지 (About Me: 포트폴리오 전시, 역량 및 GitHub 링크 등)

#### [NEW] `frontend/src/app/todos/page.tsx`
- To-Do 리스트 및 달력 연동 UI 메인 페이지

#### [NEW] `frontend/src/components/CalendarView.tsx`
- To-Do의 `due_date` 데이터를 매핑하여 보여줄 캘린더 UI 컴포넌트

#### [NEW] `frontend/src/lib/api.ts`
- FastAPI 백엔드와 통신하기 위한 Axios 또는 Fetch API 유틸리티

#### [NEW] `frontend/src/lib/supabase.ts`
- Frontend에서의 사용자 인증(Supabase Auth 로그인/로그아웃) 처리를 위한 클라이언트

## Verification Plan

### Automated Tests (선택)
- **FastAPI 백엔드**: `pytest`를 통한 Todo CRUD API 엔드포인트 정상 작동 여부 단위 테스트
- **Frontend**: 핵심 컴포넌트 렌더링 검증

### Manual Verification
1. **로컬 연동 테스트:** 로컬에서 프론트엔드(Next.js, 포트 3000)와 백엔드(FastAPI, 포트 8000)를 실행하고, CORS 문제 없이 서로 통신(API 호출)이 되는지 확인합니다.
2. **회원가입/로그인 검증:** Supabase Auth를 통한 정상적인 이메일 가입/로그인 및 인증 토큰(Session) 획득을 확인합니다.
3. **핵심 기능 테스트:** 
   - 사용자가 새로운 To-Do를 추가하고, 데이터베이스(Supabase)에 반영되는지 확인합니다.
   - 설정된 To-Do의 마감일(Due Date)이 캘린더 뷰(CalendarView) 화면에 알맞게 표시되는지 브라우저에서 직접 클릭하며 확인합니다.
4. **클라우드 배포 점검:** 
   - Vercel에 코드를 푸시하여 Frontend 자동 빌드 및 글로벌 CDN 배포가 정상적인지 점검합니다.
   - Render에 Backend Docker 이미지를 빌드/배포하여, 외부 클라이언트(배포된 Vercel 앱)의 요청을 정상 처리하는지 확인합니다.
