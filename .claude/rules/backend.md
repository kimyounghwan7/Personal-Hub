---
paths:
  - "backend/**"
---

# Backend & DB 스키마 작업 규칙 (FastAPI · SQLAlchemy · Alembic)

`model-hub` 에서 검증된 백엔드 계층 규칙(`P1~P5`, `R1~R5`, `C1~C5`)과 DB 스키마 규칙(`S1~S8`)을 비용 안전 경계(결정 CS-3, CS-4) 및 아키텍처 결정(ARCH-5)과 결합해 적용한다.

## 1. 계층 분리 및 책임 경계 (`P1~P5`, `R1~R5`, `C1~C5`)

1. **`P1` / `R2` (ORM ↔ 스키마 분리)**:
   - SQLAlchemy ORM 모델(`backend/app/models/`)과 Pydantic 입출력 스키마(`backend/app/schemas/`)를 엄격히 분리한다.
   - ORM 모델의 컬럼 타입(`Date`, `DateTime(timezone=True)` 등)과 Pydantic 스키마 필드 타입(`date`, `datetime` 등)을 일치시킨다.
2. **`R3` / `C1` (얇은 라우터 — 직접 DB 접근 금지)**:
   - 라우터(`backend/app/api/v1/endpoints/*.py`)는 HTTP 입출력과 의존성 주입(`Depends`)만 담당하며, `db.query(...)` · `db.add(...)` · `db.commit()` 을 직접 호출하지 않는다.
   - 모든 API 경로는 `/api/v1/*` 버전 프리픽스를 유지한다.
3. **`R3` / `R4` / `C2` / `C3` (쓰기 `services` ↔ 읽기 `queries` 분리)**:
   - 상태 변경 · 한도 검사(`MAX_TODOS_PER_USER = 500`) · 트랜잭션 경계(`db.commit()`)는 `backend/app/services/*_service.py` 에만 둔다.
   - 캘린더 기간 조회 · 다중 조건 필터링 등 읽기 전용 쿼리 조립은 `backend/app/services/*_queries.py` 로 분리한다(결정 ARCH-5).
4. **`C5` (내부 예외 원문 은닉)**:
   - 외부 API(Supabase Admin Auth 등) 및 DB 오류 처리 시 `str(e)` 원문을 클라이언트 응답에 그대로 노출하지 않고 서버 로그에만 남긴다.

## 2. 인증 · 권한 · 계정 격리

1. 일반 기능 엔드포인트는 `get_current_approved_profile`(`is_approved == True` 검증 포함)을 사용한다.
2. 관리자 전용 엔드포인트는 `get_current_admin_profile`(`role == "admin"` 검증 포함)을 사용한다.
3. 모든 사용자 데이터 조회 · 수정 · 삭제 쿼리는 반드시 `Todo.user_id == profile.id` 및 `Todo.deleted_at.is_(None)` 조건으로 범위를 제한한다.
4. `ADMIN_EMAIL` 환경변수와 일치하는 계정의 자동 관리자 승격 규칙(`AuthService`)을 보존한다.

## 3. DB 스키마 및 비용 방어 (`S1~S8`, `CS-3`)

1. **`S1` / `S3` (PK 및 FK 수명주기)**:
   - 부모(`Profiles.id`) 삭제 시 자식(`Todos.user_id`)의 `ondelete="CASCADE"` 수명주기를 명시한다.
2. **`S2` (중복 허용 의도 명시)**:
   - 자연키 UNIQUE 제약이 없는 테이블(`Todos`)은 모델 docstring 에 중복 제목 허용 의도를 명시한다.
3. **`S6` / `S7` (소프트 삭제 3종 세트 및 Live 부분 인덱스)**:
   - 소프트 삭제 대상 모델(`Todos`)은 `deleted_at`, `deleted_by`, `delete_reason` 3종 컬럼을 함께 두고, 활성 행 조회는 항상 `deleted_at.is_(None)` 을 필터링하며 부분 인덱스(`WHERE deleted_at IS NULL`)를 둔다(결정 ARCH-5).
4. **`S8` (DB `ENUM` 금지)**:
   - PostgreSQL `CREATE TYPE ... AS ENUM` 대신 `String(N)` 컬럼과 Pydantic `Literal[...]` 조합을 사용한다(`TodoStatus`, `TodoCategory`).
5. **`CS-3` (입력 길이 상한 강제)**:
   - 모든 요청 스키마(`*Create`, `*Update`)의 문자열 필드에 `Field(max_length=...)` 를 명시해 대용량 페이로드 공격을 차단한다.

## 4. 자동 하니스 검증 (`WF-9`)

- 동작 · 스키마 · 아키텍처 규칙을 바꿨으면 `backend/tests/test_*.py` 및 `backend/tests/test_architecture_harness.py` 를 갱신하고 `pytest` 통과와 Red-check(위반 시 실제로 실패하는지 확인)를 수행한다.
