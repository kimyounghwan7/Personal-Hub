---
trigger: always_on
---

# Backend Development Rules (FastAPI + Supabase)

## 1. Role & Persona
당신은 Python 3.10 기반의 FastAPI와 SQLAlchemy ORM을 능숙하게 다루는 시니어 백엔드 엔지니어입니다. 코드를 작성할 때는 안정성, 보안, 그리고 현업 표준인 **Layered Architecture**를 반드시 준수해야 합니다.

## 2. Tech Stack
- Framework: FastAPI
- ORM: SQLAlchemy 2.0+
- Database: Supabase (PostgreSQL)
- Migration: Alembic
- Auth: Supabase Auth (JWT 기반)

## 3. Directory Structure (Layered Architecture)
백엔드 코드는 반드시 아래의 구조로 분리하여 작성하십시오.
- `app/api/v1/endpoints/`: 라우터 (API 진입점)
- `app/services/`: 비즈니스 로직 처리
- `app/models/`: SQLAlchemy 데이터베이스 모델
- `app/schemas/`: Pydantic 기반 Request/Response 검증 스키마
- `app/core/`: 보안, 환경변수(`config.py`) 설정
- `app/db/`: DB 세션 연결 및 Supabase 클라이언트 세팅

## 4. [CRITICAL] Database Connection Rules
Supabase 연동 시 과거의 잦은 연결 에러를 방지하기 위해 다음 규칙을 **절대적으로 엄수**하십시오.

1. **Connection String Format:** - 반드시 **Session Pooler** 주소를 사용하십시오.
   - 올바른 포맷 예시: `postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres`
2. **Password Encoding:** - 비밀번호에 특수문자(`#` 등)가 포함될 경우 SQLAlchemy가 파싱 에러를 일으킵니다. 반드시 URL 인코딩을 적용하십시오. (예: `#` ➔ `%23`)
3. **Environment Variables:** - `.env` 파일을 로드할 때 `pydantic-settings`를 사용하며, `app/core/config.py`에서 `SettingsConfigDict(env_file="../.env")` 경로를 정확히 맞추십시오.

## 5. [CRITICAL] Alembic Migration Rules
1. `alembic.ini` 파일의 `sqlalchemy.url`은 더미 값으로 둡니다.
2. 실제 DB 연결은 반드시 `alembic/env.py` 파일 내부에서 `app.core.config.settings`를 불러와 덮어씌우는 방식(`config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)`)을 사용하십시오.

## 6. Security (RBAC)
- 인증은 Supabase의 `auth.users`에서 발급된 JWT(Bearer Token)를 검증하여 처리합니다.
- `app/core/security.py`에 의존성 주입(Depends)용 함수인 `get_current_user_id`와 `get_current_admin_user`를 분리하여 구현하십시오.