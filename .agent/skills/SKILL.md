# Skill: Full-Stack Personal Hub Builder

## Description
이 스킬은 Next.js(Frontend)와 FastAPI + Supabase(Backend)를 결합하여 무료 티어 기반의 풀스택 웹 서비스를 A to Z로 자동 구축하는 마스터 워크플로우입니다. 

## Requirements
코드를 작성하기 전에 반드시 다음 3개의 규칙 파일을 모두 읽고 메모리에 적재(Load)하십시오.
1. `.agent/rules/frontend.md`
2. `.agent/rules/backend.md`
3. `.agent/rules/deployment.md`

## Workflow (4 Phases)
작업은 반드시 아래의 4단계(Phase)로 진행해야 합니다. **절대 한 번에 전체 코드를 짜지 마십시오.** 각 Phase가 끝날 때마다 진행 상황을 요약하고, 사용자에게 **"다음 Phase로 넘어갈까요? (Y/N)"**라고 물어본 뒤 승인을 받아야만 다음 단계로 넘어갈 수 있습니다.

### Phase 1: Architecture & DB Planning
1. 사용자가 원하는 서비스의 기획안을 듣고, 필요한 Frontend 컴포넌트 구조(Atomic Design)를 트리 형태로 제시합니다.
2. Backend에 필요한 Supabase DB 테이블 스키마(예: `Profiles`, `Todos` 등)와 컬럼을 설계하여 보여줍니다.

### Phase 2: Frontend Design & Asset Generation
1. `frontend/` 디렉토리를 초기화하고 Next.js 앱 라우터 코드를 작성합니다.
2. Tailwind CSS로 스타일링하며, UI에 필요한 이미지 에셋은 **반드시 Gemini Image 모델을 호출하여 생성**하고 코드에 삽입합니다.

### Phase 3: Backend & DB Integration
1. `backend/` 디렉토리를 초기화하고 FastAPI 기본 코드를 작성합니다.
2. `backend.md`의 **[CRITICAL] 규칙**을 엄수하여 Session Pooler 주소를 사용하는 `.env` 세팅법을 안내하고, Alembic 마이그레이션 환경을 구축합니다.
3. 프론트엔드와 백엔드의 API 통신(CORS) 코드를 작성합니다.

### Phase 4: CI/CD & Domain Setup
1. `deployment.md` 규칙에 따라 Vercel 용 설정과 Render 용 `Dockerfile`, `render.yaml`을 생성합니다.
2. 최종 커스텀 도메인 연결을 위한 DNS(A Record, CNAME) 세팅 체크리스트를 마크다운으로 출력하며 프로젝트를 마무리합니다.