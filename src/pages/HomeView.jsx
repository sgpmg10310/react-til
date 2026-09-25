import { useNavigate, Link } from 'react-router-dom';
import styles from './HomeView.module.css';

const STUDY_TOPICS = [
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
  {
    title: '프론트엔드 방법론',
    emoji: '📐',
    summary: '실무 개발 프로세스/하네스 예제',
    path: '/frontend-methodology',
    colorClass: styles.methodButton,
  },
  {
    title: '프론트엔드 기본 스킬',
    emoji: '✅',
    summary: '기초 역량 로드맵과 실전 체크포인트',
    path: '/frontend-basic-skills',
    colorClass: styles.skillButton,
  },
];

const NEW_EXAMPLES = [
  { title: 'Git 실무 플레이북', path: '/git-advanced-playbook', emoji: '🌿' },
  { title: 'Spring AI + MCP', path: '/spring-ai-mcp-tools', emoji: '🤖' },
  { title: 'Firebase 프론트 구축', path: '/firebase-frontend-boot', emoji: '🔥' },
  { title: '무한 스크롤 + 새로고침', path: '/infinite-scroll-refresh-lab', emoji: '∞' },
  { title: 'Hooks + Immer', path: '/hooks-immer', emoji: '🥶' },
  { title: 'React Native', path: '/react-native', emoji: '📱' },
  { title: 'Swift 기초', path: '/swift', emoji: '🍎' },
  { title: '모노레포 전략', path: '/monorepo', emoji: '🏢' },
  { title: 'SWC 컴파일러', path: '/swc', emoji: '⚡' },
];

const FRONTEND_DOCS = [
  { name: 'React Docs', url: 'https://react.dev/' },
  { name: 'Vue Docs', url: 'https://vuejs.org/' },
  { name: 'Next.js Docs', url: 'https://nextjs.org/docs' },
  { name: 'Nuxt Docs', url: 'https://nuxt.com/docs' },
  { name: 'TypeScript Docs', url: 'https://www.typescriptlang.org/docs/' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
];

const BACKEND_DOCS = [
  { name: 'Spring Docs', url: 'https://docs.spring.io/spring-framework/reference/' },
  { name: 'Spring Boot Docs', url: 'https://docs.spring.io/spring-boot/index.html' },
  { name: 'Node.js Docs', url: 'https://nodejs.org/docs/latest/api/' },
  { name: 'Express Docs', url: 'https://expressjs.com/' },
  { name: 'NestJS Docs', url: 'https://docs.nestjs.com/' },
  { name: 'FastAPI Docs', url: 'https://fastapi.tiangolo.com/' },
];

/**
 * 가벼운 홈: 패턴·대량 코드 블록은 제거해 스크롤·페인트 부담을 줄임.
 * 배경이 어두우므로 본문은 밝은 톤(모듈 CSS).
 */
export default function HomeView() {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>React 문법, 기초부터 심화까지!</h1>
        <p className={styles.subtitle}>
          이곳에서 React의 핵심 개념들을 하나씩 정복해 보세요.
        </p>
        <button type="button" className={styles.ctaButton} onClick={() => navigate('/about')}>
          학습 시작하기 <span aria-hidden="true">🚀</span>
        </button>

        <div className={styles.actionBannerGroup}>
          <button
            type="button"
            className={`${styles.hangulBanner} ${styles.actionBanner}`}
            onClick={() => navigate('/about')}
          >
            <div className={styles.hangulEmoji} aria-hidden="true">
              🚀
            </div>
            <div className={styles.hangulText}>
              <p className={styles.hangulBannerTitle}>학습 시작하기</p>
              <p className={styles.hangulBannerSub}>React 문법 학습 허브로 이동합니다.</p>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.hangulBanner} ${styles.actionBanner}`}
            onClick={() => navigate('/vue-syntax')}
          >
            <div className={styles.hangulEmoji} aria-hidden="true">
              💚
            </div>
            <div className={styles.hangulText}>
              <p className={styles.hangulBannerTitle}>Vue 기본 문법</p>
              <p className={styles.hangulBannerSub}>Vue 핵심 문법 예제로 바로 이동합니다.</p>
            </div>
          </button>

          <button
            type="button"
            className={`${styles.hangulBanner} ${styles.actionBanner}`}
            onClick={() => navigate('/js-100')}
          >
            <div className={styles.hangulEmoji} aria-hidden="true">
              💛
            </div>
            <div className={styles.hangulText}>
              <p className={styles.hangulBannerTitle}>자바스크립트 학습</p>
              <p className={styles.hangulBannerSub}>기초부터 100제까지 빠르게 학습합니다.</p>
            </div>
          </button>
        </div>

        {/* 🎮 추가 게임 섹션 */}
        <div className={styles.shortcutRow} style={{ marginTop: '10px' }}>
          <button
            type="button"
            className={`${styles.hangulBanner} ${styles.actionBanner}`}
            onClick={() => window.open(`${import.meta.env.BASE_URL}games/bowling/index.html`, '_blank')}
            style={{ backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' }}
          >
            <div className={styles.hangulEmoji} aria-hidden="true">
              🎳
            </div>
            <div className={styles.hangulText}>
              <p className={styles.hangulBannerTitle}>볼링게임 조짜기 & 패싸움</p>
              <p className={styles.hangulBannerSub}>브라우저 새 탭에서 볼링게임을 실행합니다.</p>
            </div>
          </button>
        </div>

        <div className={styles.actionBannerGroup}>
          <button
            type="button"
            className={`${styles.hangulBanner} ${styles.actionBanner}`}
            onClick={() => navigate('/ninja-game-hub')}
          >
            <div className={styles.hangulEmoji} aria-hidden="true">
              🥷
            </div>
            <div className={styles.hangulText}>
              <p className={styles.hangulBannerTitle}>나루토 맛 닌자 게임</p>
              <p className={styles.hangulBannerSub}>스테이지별 연출과 보스전을 즐겨보세요.</p>
            </div>
          </button>
          <button
            type="button"
            className={`${styles.hangulBanner} ${styles.actionBanner}`}
            onClick={() => navigate('/test')}
          >
            <div className={styles.hangulEmoji} aria-hidden="true">
              🧪
            </div>
            <div className={styles.hangulText}>
              <p className={styles.hangulBannerTitle}>문제가 계속되나요? 테스트 페이지</p>
              <p className={styles.hangulBannerSub}>환경 점검용 테스트 화면으로 이동합니다.</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          className={styles.hangulBanner}
          onClick={() => navigate('/hangul-game')}
        >
          <div className={styles.hangulEmoji} aria-hidden="true">
            👑
          </div>
          <div className={styles.hangulText}>
            <p className={styles.hangulBannerTitle}>세종대왕님도 빵 터진 한글 게임!</p>
            <p className={styles.hangulBannerSub}>
              자음·모음 합치기와 그림 맞추기 <span aria-hidden="true">🚀</span>
            </p>
          </div>
        </button>

        <section className={styles.topicSection} aria-labelledby="topics-heading">
          <h2 id="topics-heading" className={styles.topicTitle}>
            확장 학습 주제
          </h2>
          <p className={styles.topicSubtitle}>
            React 외 확장 주제는 여기서 바로 이동할 수 있습니다.
          </p>
          <div className={styles.topicGrid}>
            {STUDY_TOPICS.map((topic) => (
              <article key={topic.title} className={styles.topicCard}>
                <h3>
                  <span aria-hidden="true">{topic.emoji}</span> {topic.title}
                </h3>
                <p>{topic.summary}</p>
                <button
                  type="button"
                  className={`${styles.topicButton} ${topic.colorClass}`}
                  onClick={() => navigate(topic.path)}
                >
                  {topic.title} 바로가기
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.quickSection} aria-labelledby="new-heading">
          <h2 id="new-heading" className={styles.topicTitle}>
            신규 예제 바로가기
          </h2>
          <p className={styles.topicSubtitle}>
            방금 추가한 심화 학습 예제로 바로 이동합니다.
          </p>
          <div className={styles.quickGrid}>
            {NEW_EXAMPLES.map((item) => (
              <button
                type="button"
                key={item.path}
                className={styles.quickButton}
                onClick={() => navigate(item.path)}
              >
                <span aria-hidden="true">{item.emoji}</span> {item.title}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.topicSection} aria-labelledby="docs-heading">
          <h2 id="docs-heading" className={styles.topicTitle}>
            공식 문서 바로가기
          </h2>
          <p className={styles.topicSubtitle}>프론트엔드 / 백엔드 기본 문서</p>
          <div className={styles.linkGrid}>
            {[...FRONTEND_DOCS, ...BACKEND_DOCS].map((doc) => (
              <a
                key={doc.url}
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className={styles.docLink}
              >
                {doc.name}
              </a>
            ))}
          </div>
        </section>

        <p className={styles.morePatterns}>
          React 문법·심화 실습 목록은{' '}
          <Link to="/about" className={styles.inlineLink}>
            문법 학습 허브
          </Link>
          에서 이어가 보세요. 그 외 페이지는 햄버거 메뉴에서도 열 수 있어요.
        </p>
      </div>
    </div>
  );
}
