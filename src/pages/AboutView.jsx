import { Link } from 'react-router-dom';
import styles from './AboutView.module.css';

const learningTopics = [
  {
    path: '/basic-syntax',
    emoji: '📖',
    title: 'React 기본 문법',
    description: 'JSX 문법, 조건부 렌더링, 리스트 렌더링 등 React의 가장 필수적인 기본 문법을 학습합니다.',
  },
  {
    path: '/component-test',
    emoji: '🧩',
    title: '컴포넌트 통신',
    description: 'Props와 Callback을 이용한 부모-자식 컴포넌트 간 데이터 교환 방법을 알아봅니다.',
  },
  {
    path: '/hooks-test',
    emoji: '🪝',
    title: 'React Hooks 마스터',
    description: 'useState, useEffect 등 필수적인 React Hooks 사용법과 생명주기를 학습합니다.',
  },
  {
    path: '/context-api-test',
    emoji: '🌐',
    title: 'Context API',
    description: 'Props 드릴링 없이 전역 상태를 관리하는 방법을 배웁니다.',
  },
  {
    path: '/advanced-hooks-test',
    emoji: '⚙️',
    title: '심화 Hooks',
    description: 'useMemo, useCallback, useRef 등 성능 최적화와 관련된 Hooks를 학습합니다.',
  },
  {
    path: '/additional-hooks-test',
    emoji: '📚',
    title: '추가 Hooks',
    description: 'useReducer, useLayoutEffect 등 상태 관리와 렌더링에 관련된 추가 Hooks를 학습합니다.',
  },
  {
    path: '/zustand-react-query-lab',
    emoji: '🧪',
    title: 'Zustand + React Query 실습',
    description: '전역 상태 관리(Zustand)와 서버 상태 관리(React Query)를 함께 실습합니다.',
  },
  {
    path: '/hook-guide',
    emoji: '🛠️',
    title: 'React 기본 Hook 설명 + 코드',
    description: 'useEffect 포함 핵심 Hook 개념과 바로 복붙 가능한 코드 예제를 학습합니다.',
  },
  {
    path: '/infinite-scroll-refresh-lab',
    emoji: '∞',
    title: '무한 스크롤 + 새로고침 실습',
    description: '토스 스타일 피드 UX를 React로 구현하고 핵심 소스코드를 함께 학습합니다.',
  },
  {
    path: '/hooks-immer',
    emoji: '🥶',
    title: 'React Hooks + Immer',
    description: '불변성이 왜 필요한지 버그 데모로 확인하고, Immer로 깊은 상태를 쉽게 바꾸는 법을 실습합니다.',
  },
  {
    path: '/react-native',
    emoji: '📱',
    title: 'React Native 기초',
    description: '웹 React와 다른 점, Flexbox 폰 시뮬레이터, FlatList·Platform·Expo를 배웁니다.',
  },
  {
    path: '/swift',
    emoji: '🍎',
    title: 'Swift 기초 (JS 개발자용)',
    description: 'let/var, Optional, struct vs class, SwiftUI @State를 JS와 비교하며 퀴즈로 익힙니다.',
  },
  {
    path: '/monorepo',
    emoji: '🏢',
    title: '모노레포 전략',
    description: 'pnpm 워크스페이스, Turborepo 캐시, 영향 분석 시뮬레이터로 모노레포 운영법을 익힙니다.',
  },
  {
    path: '/swc',
    emoji: '⚡',
    title: 'SWC 컴파일러',
    description: 'Parse→Transform→Codegen 원리, JSX 변환 설정, AST 변환 연습장으로 컴파일러를 이해합니다.',
  },
];

export default function AboutView() {
  return (
    <div className={styles.hubContainer}>
      <h1 className={styles.title}>📚 문법 학습 허브</h1>
      <p className={styles.subtitle}>
        아래 목록에서 학습하고 싶은 React 문법을 선택하세요.
      </p>
      <div className={styles.cardGrid}>
        {learningTopics.map((topic) => (
          <div key={topic.path} className={`${styles.card} ${topic.disabled ? styles.disabled : ''}`}>
            <Link to={!topic.disabled ? topic.path : '#'} className={styles.cardLink}>
              <div className={styles.cardIcon}>{topic.emoji}</div>
              <h3 className={styles.cardTitle}>{topic.title}</h3>
              <p className={styles.cardDescription}>{topic.description}</p>
              <div className={styles.cardAction}>
                {topic.disabled ? '준비 중' : '학습하기 →'}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}