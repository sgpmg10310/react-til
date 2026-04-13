import { Link, useNavigate } from 'react-router-dom';
import styles from './AboutView.module.css';

const springTopics = [
  {
    path: '/spring/core',
    emoji: '⚙️',
    title: '1. Spring 핵심 프로젝트 요약',
    description: 'Spring Boot, Framework, Data, Security, Cloud 등 실무 핵심 프로젝트 생태계를 알아봅니다.',
  },
  {
    path: '/spring/rest-api',
    emoji: '🔌',
    title: '2. REST API 기본 문법',
    description: 'Spring Boot에서 가장 자주 사용하는 Controller, GetMapping, PostMapping 등 기본 문법 예제입니다.',
  },
  {
    path: '/spring/extensions',
    emoji: '🚀',
    title: '3. 보안/데이터/클라우드 확장',
    description: 'Spring Security, Spring Data JPA, Spring Cloud 등 엔터프라이즈 확장에 대해 알아봅니다.',
  },
  {
    path: '/spring/webflux',
    emoji: '⚡',
    title: '4. WebFlux와 마블 다이어그램',
    description: '비동기 논블로킹 리액티브 웹 프레임워크 WebFlux와 Mono/Flux의 마블 다이어그램을 학습합니다.',
  }
];

export default function SpringView() {
  const navigate = useNavigate();

  return (
    <div className={styles.hubContainer}>
      <h1 className={styles.title}>🌱 Spring 학습 허브</h1>
      <p className={styles.subtitle}>
        spring.io의 Projects 페이지를 기준으로 실무에서 가장 많이 조합하는 핵심 개념들을 학습하세요.
      </p>
      <div className={styles.cardGrid}>
        {springTopics.map((topic) => (
          <div key={topic.path} className={styles.card}>
            <Link to={topic.path} className={styles.cardLink}>
              <div className={styles.cardIcon}>{topic.emoji}</div>
              <h3 className={styles.cardTitle}>{topic.title}</h3>
              <p className={styles.cardDescription}>{topic.description}</p>
              <div className={styles.cardAction}>학습하기 →</div>
            </Link>
          </div>
        ))}
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
          ⬅️ 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
