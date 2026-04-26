# Frontend Rules & Guidelines

## 1. Tech Stack
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Language: TypeScript

## 2. Architecture (Atomic Design)
반드시 `src/components/` 디렉토리를 아래와 같이 세분화하여 설계합니다.
- `atoms/`: 버튼, 인풋 등 가장 작은 단위
- `molecules/`: 2개 이상의 atom이 결합된 형태 (예: 검색 바)
- `organisms/`: 헤더, 캘린더 등 독립적인 섹션
- `templates/`: 페이지 레이아웃
- `pages/`: 실제 Next.js app 라우트 내 페이지

## 3. Image & Assets (Gemini)
- UI 디자인을 위한 플레이스홀더 이미지나 로고는 단순한 빈 `div`로 두지 마세요.
- Antigravity 에이전트의 `generate_image` 툴을 호출하여 실제 그럴싸한 에셋을 생성하고 적용하세요.
- 매력적인 색상과 현대적인 디자인(Glassmorphism, Dark mode 등)을 최우선으로 고려하세요.

## 4. Hydration Error 방지
- 달력(react-calendar) 등 브라우저 환경(Locale, Date)에 의존적인 컴포넌트는 반드시 `isMounted` 훅 패턴을 사용하거나 `next/dynamic`(`ssr: false`)을 활용해 React Hydration Error를 원천 차단하세요.
