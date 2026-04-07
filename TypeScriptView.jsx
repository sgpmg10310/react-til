import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function TypeScriptView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔷 TypeScript 세부 문법</h1>
        <p className={styles.description}>
          타입스크립트는 자바스크립트에 타입 시스템을 더해 IDE 자동완성, 리팩터링 안전성,
          런타임 오류 감소에 도움을 주는 언어입니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 기본 타입과 인터페이스</li>
          <li>2. 제네릭 함수</li>
          <li>3. 유니온/타입 가드</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 기본 타입과 인터페이스</h3>
        <p>객체의 모양을 인터페이스로 고정하면 실수를 줄일 수 있습니다.</p>
        <pre className={styles.code}><code>{`interface User {
  id: number;
  name: string;
  email?: string;
}

const user: User = { id: 1, name: 'Park' };`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) 제네릭 함수</h3>
        <p>입력 타입과 출력 타입을 연결해 재사용 가능한 함수를 만듭니다.</p>
        <pre className={styles.code}><code>{`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first<number>([1, 2, 3]);`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) 유니온과 타입 가드</h3>
        <p>조건문으로 타입을 좁혀 안전하게 메서드를 호출합니다.</p>
        <pre className={styles.code}><code>{`function printId(id: number | string) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(0));
  }
}`}</code></pre>
      </section>

      <Link to="/" className={styles.backLink}>← 홈으로 돌아가기</Link>
    </div>
  );
}
