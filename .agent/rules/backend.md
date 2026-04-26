# Backend Rules & Guidelines

## 1. Tech Stack
- Framework: FastAPI (Python 3.10+)
- ORM: SQLAlchemy 2.0+
- Database: PostgreSQL (Supabase)
- Migrations: Alembic

## 2. Database Connection (CRITICAL)
Supabase와의 연결 시 발생할 수 있는 고질적인 네트워크 및 인코딩 이슈를 방지하기 위해 다음 규칙을 **무조건** 준수합니다.

### 2.1. Connection Method (Session Pooler 필수)
- **절대 Direct Connection(db.*.supabase.co)을 사용하지 마세요.** (IPv6 미지원 환경에서 DNS 에러 `nodename nor servname provided` 발생 위험)
- 반드시 **Session Pooler (Port 5432)** 주소를 사용하세요.
- 호스트명 예시: `aws-1-ap-northeast-2.pooler.supabase.com`
- 유저명 형식: `postgres.[본인의_Project_Ref]`

### 2.2. Password URL Encoding
- 데이터베이스 비밀번호에 `#`, `@` 등의 특수문자가 포함된 경우 `.env` 파일의 URL에서 반드시 URL 인코딩을 적용하세요.
- 예: `#` ➡️ `%23`

### 2.3. Alembic 설정 우회 (`env.py`)
- `alembic.ini` 파일의 `sqlalchemy.url`을 통해 환경변수를 주입하면 Python의 `configparser`가 `%23`을 파싱하다가 `ValueError`를 발생시킵니다.
- `alembic/env.py` 파일 내에서 `config.set_main_option`을 제거하고, `create_engine(settings.DATABASE_URL)`처럼 애플리케이션의 설정값을 직접 주입하는 방식을 사용하세요.

## 3. Security
- Admin 엔드포인트는 반드시 Middleware 또는 JWT Token Dependency를 통해 보호하세요.
- Supabase Auth를 통해 반환된 `user` 정보와 자체 `Profiles` 테이블을 조인하여 권한(`role: admin`)을 철저히 검증하세요.
