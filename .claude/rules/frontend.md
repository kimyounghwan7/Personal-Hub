---
paths:
  - "frontend/**"
---

# Frontend 작업 규칙 (Next.js App Router · Supabase SSR)

1. **라우트 및 컴포넌트 구조**:
   - `frontend/src/app/` 아래의 서버 컴포넌트(`page.tsx`)는 초기 세션/권한 확인(`getServerUser`, `getServerProfile`) 및 리다이렉트를 담당한다.
   - 브라우저 상태와 상호작용이 필요한 화면은 `frontend/src/components/*Client.tsx` 클라이언트 컴포넌트로 분리한다.
   - 백엔드 API 호출은 반드시 `frontend/src/lib/api.ts` 의 공용 Axios 인스턴스를 통해 수행한다.
2. **인증 및 세션 일관성**:
   - 쿠키 존재 여부만으로 권한을 판단하지 않는다. 서버에서는 `supabase.auth.getUser()` 및 백엔드 `/auth/profile-sync` 응답을 확인하고, 실제 데이터 접근 권한은 백엔드가 최종 판정한다.
   - 미승인 계정(`403 Waiting for admin approval`), 인증 만료(`401`), 네트워크/서버 오류 상태를 화면에서 명확히 구분해 안내한다.
3. **보안 헤더 및 CSP 정합성**:
   - `frontend/next.config.mjs` 와 `frontend/src/middleware.ts` 의 보안 헤더(`X-Frame-Options`, `Content-Security-Policy` 등)가 서로 충돌하지 않게 유지한다.
   - 배포 환경에서 `NEXT_PUBLIC_API_URL` 도메인으로의 요청이 CSP `connect-src` 에 막히지 않도록 관리한다.
4. **UI 및 검증**:
   - 모바일·데스크톱 반응형 레이아웃과 다크 톤 디자인 일관성을 유지한다.
   - 프론트엔드 수정 후에는 `cd frontend && npm run lint` 를 실행해 오류와 경고가 없는지 확인한다.
