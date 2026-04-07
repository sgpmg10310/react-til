import { useNavigate, Link } from 'react-router-dom';
import styles from './HomeView.module.css';

export default function HomeView() {
  const navigate = useNavigate();
  const studyTopics = [
    {
      title: 'TypeScript',
      emoji: '🔷',
      summary: '정적 타입으로 런타임 에러를 줄입니다.',
      path: '/typescript',
      colorClass: styles.tsButton,
    },
    {
      title: 'Next.js',
      emoji: '⚫',
      summary: '파일 기반 라우팅 + 서버 컴포넌트 기반 React 프레임워크.',
      path: '/nextjs',
      colorClass: styles.nextButton,
    },
    {
      title: 'Nuxt.js',
      emoji: '💚',
      summary: 'Vue 기반 풀스택 프레임워크로 SSR/SSG를 지원합니다.',
      path: '/nuxtjs',
      colorClass: styles.nuxtButton,
    },
    {
      title: 'Spring',
      emoji: '🌱',
      summary: 'Java 기반 서버 개발 표준 프레임워크입니다.',
      path: '/spring',
      colorClass: styles.springButton,
    },
    {
      title: '자동차 정비',
      emoji: '🚗',
      summary: '폭스바겐 골프 MK6 써모스탯 교체 가이드 (계속 업데이트 예정)',
      path: '/golf-mk6-thermostat',
      colorClass: styles.autoButton,
    },
  ];

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>React 문법, 기초부터 심화까지!</h1>
        <p className={styles.subtitle}>
          이곳에서 React의 핵심 개념들을 하나씩 정복해 보세요.
        </p>
        <button className={styles.ctaButton} onClick={() => navigate('/about')}>
          학습 시작하기 🚀
        </button>
        
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            className={styles.ctaButton} 
            style={{ background: '#f59e0b', fontSize: '0.9rem', padding: '10px 20px' }} 
            onClick={() => navigate('/callback-test')}
          >
            🔥 초간단 useCallback 바로가기
          </button>
          <button 
            className={styles.ctaButton} 
            style={{ background: '#10b981', fontSize: '0.9rem', padding: '10px 20px' }} 
            onClick={() => navigate('/vue-syntax')}
          >
            💚 Vue 기본 문법 알아보기
          </button>
        </div>

        {/* 진단용 테스트 페이지 링크 추가 */}
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          문제가 계속되나요?{' '}
          <Link to="/test" style={{ color: '#3b82f6', fontWeight: 'bold' }}>테스트 페이지로 직접 이동</Link>
        </p>

        <section className={styles.topicSection}>
          <h2 className={styles.topicTitle}>확장 학습 주제</h2>
          <p className={styles.topicSubtitle}>
            React 외에도 함께 공부하면 좋은 핵심 기술 문법 예제입니다.
          </p>
          <div className={styles.topicGrid}>
            {studyTopics.map(topic => (
              <article key={topic.title} className={styles.topicCard}>
                <h3>{topic.emoji} {topic.title}</h3>
                <p>{topic.summary}</p>
                <button
                  className={`${styles.topicButton} ${topic.colorClass}`}
                  onClick={() => navigate(topic.path)}
                >
                  {topic.title} 세부 문법 보기
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}