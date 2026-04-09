import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function BasicFrontendSkillsView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎯 프론트엔드 기본 스킬 로드맵</h1>
        <p className={styles.description}>
          프론트엔드 개발자가 실무에서 가장 먼저 갖춰야 하는 기본 역량을
          이 프로젝트 기준으로 정리했습니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. HTML/CSS 기본기</li>
          <li>2. JavaScript 핵심 문법</li>
          <li>3. React 컴포넌트 설계</li>
          <li>4. 상태 관리와 데이터 흐름</li>
          <li>5. API 통신/에러 처리</li>
          <li>6. 테스트/품질/배포</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) HTML/CSS 기본기</h3>
        <p>- 시맨틱 태그, 폼 접근성(label, aria), 반응형 레이아웃(Flex/Grid)</p>
        <p>- 공통 컴포넌트 스타일 재사용, 상태별 스타일 설계</p>
      </section>

      <section className={styles.section}>
        <h3>2) JavaScript 핵심 문법</h3>
        <p>- 비동기(`Promise`, `async/await`), 배열/객체 불변 업데이트</p>
        <p>- 구조분해, 스프레드, 모듈 import/export</p>
        <pre className={styles.code}><code>{`const nextUsers = users.map(user =>
  user.id === targetId ? { ...user, active: true } : user
);`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) React 컴포넌트 설계</h3>
        <p>- 작은 단위로 나누고, props 인터페이스를 명확히 정의</p>
        <p>- 화면(UI)과 비즈니스 로직 분리</p>
      </section>

      <section className={styles.section}>
        <h3>4) 상태 관리와 데이터 흐름</h3>
        <p>- 로컬 상태: `useState`, `useReducer`</p>
        <p>- 전역 상태: Context 또는 Zustand</p>
        <p>- 서버 상태: React Query로 로딩/에러/캐싱 표준화</p>
      </section>

      <section className={styles.section}>
        <h3>5) API 통신/에러 처리</h3>
        <p>- 성공/실패/재시도 흐름 분리, 사용자 메시지 표준화</p>
        <p>- 요청 중 중복 클릭 방지와 로딩 UI 처리</p>
        <pre className={styles.code}><code>{`try {
  const data = await fetchPosts();
  setPosts(data);
} catch (e) {
  setError(e.message || '요청 실패');
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>6) 테스트/품질/배포</h3>
        <p>- 기본: `lint + build` 항상 통과</p>
        <p>- 컴포넌트 테스트(렌더링/이벤트), E2E 핵심 시나리오 점검</p>
        <p>- GitHub Pages 배포 시 라우팅/환경변수 동작 확인</p>
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
