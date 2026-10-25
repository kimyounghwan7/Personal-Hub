---
paths:
  - "backend/**"
---

# Backend 작업 규칙 (FastAPI · SQLAlchemy · Alembic)

1. **계층 분리 (Layered Architecture)**:
   - 라우터(`backend/app/api/v1/endpoints/*.py`)는 HTTP 입출력과 의존성 주입만 담당하며 얇게 유지한다.
   - 비즈니스 로직과 DB 쿼리는 `backend/app/services/*.py` 에 둔다.
   - ORM 모델은 `backend/app/models/`, 입출력 계약은 `backend/app/schemas/` 에 둔다.
   - 모든 API 경로는 `/api/v1/*` 버전 프리픽스를 유지한다.
2. **인증 · 권한 · 데이터 격리**:
   - 일반 기능 엔드포인트는 `get_current_approved_profile`(`is_approved == True` 검증 포함)을 사용한다.
   - 관리자 전용 엔드포인트는 `get_current_admin_profile`(`role == "admin"` 검증 포함)을 사용한다.
   - 모든 사용자 데이터 조회·수정·삭제 쿼리는 반드시 `user_id == profile.id` 조건으로 범위를 제한한다.
   - `ADMIN_EMAIL` 환경변수와 일치하는 계정의 자동 관리자 승격 규칙(`AuthService`)을 보존한다.
3. **스키마 및 비용 방어**:
   - ORM 모델(`DateTime(timezone=True)` 등)과 Pydantic 스키마(`datetime` 등)의 타입을 일치시킨다.
   - 입력 스키마 문자열 필드에 `Field(min_length=..., max_length=...)` 를 명시해 비정상 대용량 입력을 차단한다(결정 CS-3).
4. **DB 연결 및 마이그레이션**:
   - 스키마 변경은 반드시 Alembic 마이그레이션(`backend/alembic/versions/`)으로 관리하며, `alembic.ini` 의 URL 은 플레이스홀더로 두고 `alembic/env.py` 에서 `settings.DATABASE_URL` 을 주입한다.
   - 외부 API(Supabase Admin Auth 등)와 DB 트랜잭션을 함께 다룰 때는 부분 실패(Partial Failure) 시 상태 불일치가 남지 않도록 순서와 예외 처리를 설계하고, 내부 예외 원문을 클라이언트 응답에 그대로 노출하지 않는다.
5. **검증**:
   - 동작이나 보안 규칙을 바꿨으면 `backend/tests/test_*.py` 에 단위 시험을 추가·갱신하고 `pytest` 로 통과를 확인한다.
