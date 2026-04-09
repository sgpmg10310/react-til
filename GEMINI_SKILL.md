# Gemini Code Assist Skill : 프로젝트 아키텍처 가이드

이 파일은 Gemini가 현재 프로젝트의 프론트엔드 개발 패턴을 이해하고, 
코드를 생성하거나 리팩토링할 때 일관된 구조를 유지하도록 지시하는 규칙 문서입니다.

## 1. 디렉토리 구조 (Feature-Sliced Pattern)
모든 소스 코드는 `src/` 디렉토리 하위에 위치하며, 역할과 도메인별로 분리됩니다.

- **`src/components/`**: 도메인에 종속되지 않고 여러 곳에서 재사용되는 UI 컴포넌트 (`Button`, `Modal`, `Child` 등)
- **`src/pages/`**: 라우터(`react-router-dom`)와 직접 연결되는 화면(View) 컴포넌트
  - `/react/`: React 핵심 문법, Hooks, 상태 관리 실습
  - `/vue/`: Vue 비교 및 문법 실습
  - `/frameworks/`: Next.js, Nuxt.js, TypeScript 관련
  - `/backend/`: Spring, Firebase, AI Tools 관련 연동 실습
  - `/methodology/`: 개발 방법론, Git, 실무 역량 정리
  - `/hobby/`: 취미, 자동차 정비 등 일상 테마
  - `/test/`: 렌더링 및 실험용 컴포넌트
- **`src/store/`**: 전역 상태 관리 (Zustand, Redux 등)
- **`src/contexts/`**: React Context API
- **`src/hooks/`**: 공통 Custom Hooks
- **`src/assets/`**: 폰트, 이미지 등 정적 리소스

## 2. 코드 작성 규칙 (Rules)
1. **관심사 분리**: 비즈니스 로직(상태, API 호출)과 UI 렌더링(JSX)을 분리합니다.
2. **스타일 격리**: 각 컴포넌트/페이지는 이름이 동일한 `.module.css`를 사용하여 전역 스타일 충돌을 방지합니다.
3. **import 경로**: 구조 개편에 따라 외부 모듈 참조 시 상대 경로(`../../`)의 깊이를 정확히 계산합니다.
4. **네이밍 컨벤션**: 페이지 컴포넌트는 `*View.jsx` 또는 `*Page.jsx` 접미사를 사용합니다.