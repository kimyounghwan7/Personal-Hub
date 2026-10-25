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

## 3. Docker 멀티스테이지 구조 및 서버 실행 (사용자 허락 필요)

`backend/Dockerfile` 과 `frontend/Dockerfile` 은 모두 **멀티스테이지 빌드(`dev` / `prod`)** 로 구성되어 있다.

- **개발용(`target: dev`)**: 소스 볼륨 마운트 및 핫 리로드(`uvicorn --reload`, `npm run dev`)로 동작한다. 컨테이너 내부 SSR 요청은 `INTERNAL_API_URL=http://backend:8000` 으로 통신하고, 브라우저 요청은 `NEXT_PUBLIC_API_URL=http://localhost:8000` 으로 통신한다.
- **배포용(`target: prod`, 기본 타겟)**: 비루트 계정(`appuser`, `nextjs`)과 Next.js `output: "standalone"` 경량 서버로 동작하며, 클라우드 컨테이너 플랫폼(Render 등)의 `$PORT` 환경변수를 지원한다.

```bash
# 1. 개발용 Docker Compose 백그라운드 빌드 및 실행 (personal-hub-backend-dev :8000, personal-hub-frontend-dev :3000)
docker compose up --build -d

# 2. 컨테이너 상태 및 로그 확인
docker compose ps
docker compose logs -f

# 3. 컨테이너 내부에서 Alembic 마이그레이션 실행
docker compose exec backend alembic upgrade head

# 4. 배포용 프로덕션 컨테이너 이미지 로컬 검증 (docker-compose.prod.yml)
docker compose -f docker-compose.prod.yml build
```
