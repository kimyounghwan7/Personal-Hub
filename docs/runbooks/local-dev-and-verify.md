# 로컬 개발 및 검증 절차

2026-10-25 · 상태: **현행** · 관련: [runbooks 색인](README.md) · [status](../status.md)

로컬 환경에서 프론트엔드·백엔드를 실행하고 커밋 전 필수 검사를 수행하는 절차다.

## 1. 환경변수(`.env`) 준비

루트 디렉토리의 `.env.example` 을 참고해 `.env` 파일을 구성한다.

```bash
# 필수 키 목록 확인 (값은 출력하지 않음)
grep -E "^[A-Z0-9_]+=" .env | cut -d= -f1
```

- `DATABASE_URL`: Supabase **Session Pooler (포트 6543)** 주소를 사용하며, 비밀번호에 `#` 이나 `%` 같은 특수문자가 있으면 URL 인코딩(`%23` 등)한다(아키텍처 결정 ARCH-2).
- `ENVIRONMENT`: 로컬 개발 시 `local` 또는 `development`, 배포 시 `production` 으로 설정한다.

## 2. 커밋 전 필수 자동 검사

코드를 고치거나 문서를 수정한 뒤 커밋하기 전에 아래 네 가지 검사를 루트 디렉토리에서 실행한다.

```bash
# 1. 문서 링크 · 색인 · 머리 · 결정 번호 · Mermaid 렌더 검사
python3 tools/docs_check.py

# 2. 백엔드 Python 코드 모양 검사 (단순 감싸기 · 깊은 들여쓰기 · 주석 규칙)
python3 tools/code_shape.py backend/app

# 3. 백엔드 단위 시험 (uv run 사용)
cd backend && ENVIRONMENT=local PYTHONPATH=. uv run --no-project --python 3.11 --with-requirements requirements.txt pytest tests/

# 4. 프론트엔드 ESLint 검사
cd frontend && npm run lint
```

## 3. DB 마이그레이션 및 서버 실행 (사용자 허락 필요)

```bash
# Alembic 마이그레이션 반영
cd backend && alembic upgrade head

# 전체 스택 Docker Compose 실행
docker compose up --build
```
