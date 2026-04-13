import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function SpringExtensionView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🚀 3. 보안/데이터/클라우드 확장 포인트</h1>
        <p className={styles.description}>Spring 생태계를 이용해 엔터프라이즈급으로 확장하는 방법을 알아봅니다.</p>
      </header>

      <section className={styles.section}>
        <h3>확장 포인트</h3>
        <p><strong>보안</strong>: Spring Security + JWT/OAuth2로 인증 체계 확장</p>
        <p><strong>데이터</strong>: Spring Data JPA로 CRUD 표준화, QueryDSL로 복잡 쿼리 처리</p>
        <p><strong>클라우드</strong>: Spring Cloud로 분산 환경 공통 문제를 모듈 단위로 해결</p>
      </section>

      <Link to="/spring" className={styles.backLink}>← Spring 학습 허브로 돌아가기</Link>
    </div>
  );
}