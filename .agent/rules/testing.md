---
trigger: always_on
---

# Testing Standards & Rules (Mandatory)

## 1. General Philosophy
- "테스트가 없는 코드는 완성되지 않은 코드다."
- 모든 핵심 비즈니스 로직과 UI 컴포넌트는 독립적인 단위 테스트(Unit Test)를 가져야 합니다.
- 에이전트는 기능 구현 직후 해당 기능에 대한 테스트 코드를 먼저 작성하고 실행 결과(Pass/Fail)를 보고해야 합니다.

## 2. Backend Testing (FastAPI)
- **Framework:** `pytest`
- **Tooling:** `httpx` (Async 테스트용), `pytest-mock` (DB/외부 API 모킹)
- **Essential Test Cases:**
  1. **Service Layer:** 비즈니스 로직(예: Todo 생성 시 유효성 검사)의 독립적 검증.
  2. **API Endpoints:** FastAPI `TestClient`를 활용하여 상태 코드(200, 404, 401 등)와 JSON 응답 규격 확인.
  3. **Auth Logic:** JWT 토큰 유무에 따른 접근 제어(RBAC) 정상 작동 여부.

## 3. Frontend Testing (Next.js)
- **Framework:** `Vitest` + `React Testing Library`
- **Tooling:** `msw` (Mock Service Worker)를 활용한 API 모킹.
- **Essential Test Cases:**
  1. **Atomic Components:** Atoms, Molecules 단위의 컴포넌트가 Props에 따라 정확히 렌더링되는지 확인.
  2. **User Interaction:** 버튼 클릭, 타이핑 등 사용자 입력 시 상태(State) 변화 및 함수 호출 여부 검증.
  3. **Hooks & Utils:** 커스텀 훅(예: `useTodos`)이나 유틸리티 함수의 로직 검증.

## 4. [CRITICAL] Testing Gate
- 에이전트는 새로운 기능을 PR(Pull Request) 스타일로 제안할 때, 반드시 **"작성한 테스트 코드"**와 **"테스트 실행 로그"**를 함께 제출해야 합니다.