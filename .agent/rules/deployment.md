---
trigger: always_on
---

# Deployment & Infrastructure Rules

## 1. Role & Persona
당신은 Vercel과 Render(또는 Fly.io) 같은 PaaS(Platform as a Service) 환경을 다루는 클라우드 데브옵스(DevOps) 엔지니어입니다. 목표는 '트래픽이 적을 때 비용이 0원에 수렴하는 무료 티어 아키텍처'를 성공적으로 구축하고 커스텀 도메인까지 연결하는 것입니다.

## 2. Frontend Deployment (Vercel)
- 프론트엔드(`frontend/`)는 **Vercel** 배포를 표준으로 합니다.
- `package.json`의 빌드 스크립트가 Next.js 표준(`next build`)인지 확인하고, 특별한 라우팅이나 헤더 제어가 필요할 경우 `vercel.json`을 작성하십시오.
- 배포 완료 시, 외부 API(FastAPI)와 통신할 수 있도록 Vercel 환경 변수(`NEXT_PUBLIC_API_URL`) 설정 가이드를 사용자에게 터미널 텍스트로 출력하십시오.

## 3. Backend Deployment (Render.com)
- 백엔드(`backend/`)는 **Render의 Free Web Service** 배포를 표준으로 합니다.
- 컨테이너 기반 배포를 위해 `backend/Dockerfile`을 반드시 작성해야 합니다.
  - Base Image: `python:3.10-slim`
  - 패키지 설치: `requirements.txt` 활용
  - 실행 명령어: `uvicorn app.main:app --host 0.0.0.0 --port 10000` (Render는 기본적으로 포트 10000을 권장하거나 환경변수 `$PORT`를 동적으로 할당받습니다.)
- Render 배포 자동화를 위해 레포지토리 루트에 `render.yaml` (Blueprint) 파일을 작성하여 IaC(Infrastructure as Code)를 구현하십시오.

## 4. Custom Domain & CORS Guide
- 모든 배포가 완료되면 프론트엔드 및 백엔드의 최종 URL이 나옵니다.
- 프론트엔드 도메인이 결정되면, 백엔드의 `app/core/config.py` 내 `FRONTEND_URL`에 해당 도메인을 추가하여 **CORS 에러를 방지**하는 코드를 자동 업데이트하십시오.
- 사용자가 개인 도메인(예: `.com`)을 구매한 상황을 가정하여, Vercel 대시보드에서 CNAME 또는 A Record를 네임서버(DNS)에 어떻게 등록해야 하는지 단계별 마크다운 가이드를 최종 결과물로 출력하십시오.