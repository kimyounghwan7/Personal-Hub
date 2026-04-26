# Personal Hub (To-do & Admin Dashboard)

본 프로젝트는 Next.js(Frontend)와 FastAPI + SQLAlchemy(Backend)를 활용하여 구축된 개인 포트폴리오 및 생산성(To-do) 관리 플랫폼입니다.
데이터베이스 및 사용자 인증(Auth)은 Supabase를 활용하며, 현업 표준인 Layered Architecture와 보안(RBAC) 체계를 적용했습니다.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, React Calendar
- **Backend**: Python 3.10, FastAPI, SQLAlchemy ORM, Alembic (Migration)
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth)
- **Infrastructure**: Docker, Docker Compose

---

## 🚀 Supabase 클라우드 세팅 가이드

이 프로젝트를 로컬에서 온전히 실행하려면 먼저 Supabase 대시보드에서 프로젝트를 생성하고 환경변수를 발급받아야 합니다.

### 1. Supabase 프로젝트 생성
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인합니다.
2. `New Project`를 클릭하고, Organization과 Project Name(예: Personal Hub)을 입력한 뒤, **Database Password**를 설정합니다. (이 비밀번호는 반드시 기억해 두세요!)
3. 리전(Region)을 설정하고 `Create new project`를 누릅니다. (DB 세팅에 약 2~3분이 소요됩니다.)

### 2. 환경 변수(API Keys 및 DB URL) 발급 방법
프로젝트 세팅이 완료되면 좌측 톱니바퀴 ⚙️ (**Project Settings**) 메뉴로 이동합니다.

*   **API URL 및 Keys 발급:**
    *   **Project Settings > API** 메뉴로 들어갑니다.
    *   `Project URL` 값을 복사합니다. ➡️ `.env`의 `SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_URL`
    *   `anon` / `public` 키를 복사합니다. ➡️ `.env`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `service_role` / `secret` 키를 복사합니다. ➡️ `.env`의 `SUPABASE_KEY` (이 키는 절대 프론트엔드에 노출하면 안 됩니다!)

*   **Database URL (Connection String) 발급 및 연결 방식 선택 가이드:**
    *   **Project Settings > Database** 메뉴로 들어갑니다. (또는 최상단 'Connect' 버튼 클릭)
    *   하단으로 스크롤하여 **Connection string** 섹션을 찾고 탭을 **URI**로 변경합니다.
    *   **[중요] 어떤 연결 방식을 선택해야 할까요?**
        본 프로젝트는 **FastAPI(상시 실행되는 서버) + SQLAlchemy(자체 커넥션 풀링 사용)** 아키텍처를 가집니다.
        1. **Direct connection (추천/하지만 IPv6 필수)**: 상시 실행되는 컨테이너 환경에 가장 이상적입니다. 단, Supabase 정책상 **IPv6**로만 연결되므로 로컬 개발망이나 Docker 환경이 IPv6를 지원하지 않으면 연결 에러(`nodename nor servname provided`)가 발생합니다.
        2. **Transaction pooler (비추천)**: Vercel, AWS Lambda 같은 서버리스(Serverless) 환경용입니다. FastAPI 같은 상시 서버에서는 SQLAlchemy의 자체 풀링 기능을 끄고 사용해야 하므로 성능상 불리합니다.
        3. **Session pooler (가장 강력히 추천 - IPv4 호환)**: Direct 연결과 동일한 기능을 제공하면서 **IPv4 네트워크를 지원**합니다. 로컬 개발 에러를 방지하고 SQLAlchemy의 강력한 커넥션 풀링을 그대로 활용할 수 있으므로 **현재 서비스 특성상 가장 완벽한 선택**입니다.
    *   따라서 **Session pooler** 라디오 버튼을 선택하고, 하단 언어를 **SQLAlchemy**로 맞춘 뒤 제공되는 **코드 박스 내부의 호스트 주소(URL)**를 복사합니다.
    *   복사한 문자열에서 `[YOUR-PASSWORD]` 부분을 프로젝트 생성 시 설정한 **실제 비밀번호**로 변경합니다. (주의: 비밀번호에 `#` 기호가 있다면 `%23`으로 치환하세요!) ➡️ `.env`의 `DATABASE_URL`

---

## 💻 로컬 개발 환경 세팅 (Local Development Setup)

### 1. 환경변수 설정
프로젝트 루트 디렉토리에 있는 `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 위에서 발급받은 Supabase 값들을 기입합니다.

```bash
# .env 파일 예시
NEXT_PUBLIC_SUPABASE_URL=https://[당신의-프로젝트-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_URL=https://[당신의-프로젝트-ID].supabase.co
SUPABASE_KEY=eyJh... (service_role 키)
DATABASE_URL=postgresql://postgres.[당신의-프로젝트-ID]:[비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres

NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. 데이터베이스 스키마 마이그레이션 (Alembic)
SQLAlchemy 기반의 스키마를 Supabase DB에 반영하기 위해 마이그레이션을 실행합니다.
로컬 환경에 Python이 설치되어 있어야 합니다.

```bash
cd backend
python3 -m pip install -r requirements.txt
# 마이그레이션 반영 (테이블 자동 생성)
alembic upgrade head
cd ..
```
*성공 시 Supabase Dashboard의 Table Editor에 `Profiles`와 `Todos` 테이블이 생성된 것을 볼 수 있습니다.*

### 3. 프로젝트 컨테이너 실행 (Docker Compose)
로컬 PC에 Docker가 설치되어 있다면 아래 명령어로 프론트엔드와 백엔드를 동시에 실행할 수 있습니다.

```bash
docker compose up --build
```
- **Frontend URL**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🛡 관리자(Admin) 권한 부여 방법
본 시스템은 역할 기반 접근 제어(RBAC)를 지원합니다.
1. 웹 브라우저(localhost:3000)에서 회원가입을 먼저 진행합니다.
2. [Supabase Dashboard](https://supabase.com/dashboard) -> **Table Editor** -> `Profiles` 테이블로 이동합니다.
3. 방금 가입한 본인 계정의 `role` 컬럼 값을 `user`에서 **`admin`**으로 직접 타이핑하여 변경(Update)합니다.
4. 웹 새로고침 후 상단 내비게이션 바에 나타난 **Admin** 메뉴를 클릭하여 대시보드에 접근합니다.
