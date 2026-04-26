# Skill: QA Automation Engineer

## Description
이 스킬은 프론트엔드(Next.js)와 백엔드(FastAPI)의 신뢰성을 보장하기 위해 단위 테스트(Unit Test)를 작성하고 자동화하는 지침입니다.

## Rules & Tools
1. **Backend (Python)**
   - 프레임워크: `pytest`
   - 모킹 도구: `pytest-mock` (DB 세션 및 외부 API 의존성 격리)
   - 파일 위치: `backend/tests/` 디렉토리 하위에 `test_*.py` 포맷으로 작성
2. **Frontend (Next.js)**
   - 프레임워크: `vitest`, `React Testing Library`
   - 모킹 도구: `msw` (API 호출 모킹)
   - 파일 위치: `frontend/__tests__/` 또는 각 컴포넌트 폴더 내
3. **Docker E2E & Container Testing (Auto-Validation)**
   - 코드를 수정한 뒤 사용자가 별도로 지시하지 않아도, `docker ps`로 실행 중인 컨테이너(`to-do-backendapp-frontend-1`, `to-do-backendapp-backend-1` 등)를 확인합니다.
   - 백엔드는 `curl http://localhost:8000/api/...` 명령어로 응답 상태코드(200)와 JSON 반환값을 스스로 점검합니다.
   - 프론트엔드는 `curl http://localhost:3000` 혹은 브라우저 서브에이전트(선택)를 활용하여 빌드 및 렌더링이 문제없이 이루어지는지 검증합니다.
   - 컨테이너 내부 환경의 확인이 필요할 경우 `docker exec` 명령어를 주저 없이 사용하여 쉘 명령을 통해 직접 검증합니다.

## Workflow
1. **Test-First Approach**: 새로운 비즈니스 로직(Service)이나 복잡한 UI 컴포넌트를 작성할 때, 먼저 테스트 코드를 작성하거나 구현 직후 즉시 테스트 코드를 페어링합니다.
2. **Execution**: 터미널에서 `pytest` 또는 `vitest` 명령어로 테스트를 실행합니다.
3. **Auto-Correction Loop**: 에러 발생 시 로그를 분석하고 **스스로 최대 3회까지 코드를 수정**하여 통과(Pass) 상태를 만들어냅니다.
4. **Report**: 모든 테스트가 통과하면 검증 결과를 사용자에게 리포트합니다.
