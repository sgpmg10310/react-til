# Gemini Code Assist Skill : 프로젝트 아키텍처 가이드

이 파일은 Gemini가 현재 프로젝트의 프론트엔드 개발 패턴을 이해하고 일관된 구조를 유지하도록 지시하는 규칙 문서입니다.

## 1. 디렉토리 구조 (Feature-Sliced Pattern)
- **`src/components/`**: 재사용 UI 컴포넌트
- **`src/pages/`**: 라우터 연결 화면 컴포넌트 (`*View.jsx` 접미사)
- **`src/store/`**: 전역 상태 관리
- **`src/contexts/`**: React Context API
- **`src/hooks/`**: 공통 Custom Hooks
- **`src/assets/`**: 정적 리소스

## 2. 6단계 워크플로우 연동
- 모든 개발 작업은 `/nh:plan`부터 `/nh:result`까지 6단계를 엄격히 준수합니다.
- 각 단계의 결과물은 루트 및 `.gemini/` 또는 `.codex/` 하위에 기록됩니다.

## 3. 코드 작성 및 성능 규칙
1. **관심사 분리**: 로직과 UI 분리.
2. **스타일 격리**: `.module.css` 사용 필수.
3. **Z Fold 7 최적화**: `design-rules.mdc`에 명시된 3D 배경 금지 및 `backdrop-filter` 제한 준수.
4. **Props 정의**: 컴포넌트 props는 `interface`로 정의하며, 가능한 `tsx` 전환을 권장함.
