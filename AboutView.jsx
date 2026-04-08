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
    path: '/frontend-methodology',
    emoji: '📐',
    title: '프론트엔드 방법론 스킬/하네스',
    description: '실무 개발 방법론에서 필요한 역량과 테스트 하네스 예제를 정리합니다.',
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