import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function SpringCoreProjectView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>⚙️ 1. Spring 핵심 프로젝트 한글 요약</h1>
        <p className={styles.description}>spring.io에서 제공하는 주요 프로젝트 생태계 요약입니다.</p>
      </header>

      <section className={styles.section}>
        <h3>spring.io 핵심 프로젝트</h3>
        <p><strong>Spring Boot</strong>: 기본 설정을 자동화해 빠르게 실행 가능한 앱을 만듭니다.</p>
        <p><strong>Spring Framework</strong>: DI, 트랜잭션, 웹, 데이터 접근 등 코어 기능을 제공합니다.</p>
        <p><strong>Spring Data</strong>: JPA, MongoDB 등 다양한 저장소를 일관된 방식으로 다룹니다.</p>
        <p><strong>Spring Security</strong>: 인증/인가를 표준 방식으로 적용합니다.</p>
        <p><strong>Spring Cloud</strong>: 마이크로서비스 패턴(설정, 게이트웨이, 서비스 디스커버리 등)을 지원합니다.</p>
      </section>

      <Link to="/spring" className={styles.backLink}>← Spring 학습 허브로 돌아가기</Link>
    </div>
  );
}