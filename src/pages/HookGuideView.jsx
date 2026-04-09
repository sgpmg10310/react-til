import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function HookGuideView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🪝 React 기본 Hook 가이드</h1>
        <p className={styles.description}>
          프론트엔드에서 가장 자주 쓰는 `useState`, `useEffect`, `useMemo`, `useRef`를
          핵심 개념 + 바로 실행 가능한 예제로 정리했습니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. useState: 상태 관리</li>
          <li>2. useEffect: 사이드 이펙트 처리</li>
          <li>3. useMemo: 계산 캐싱</li>
          <li>4. useRef: DOM/값 참조</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) useState</h3>
        <p>컴포넌트 내부 상태를 보관하고 변경할 때마다 다시 렌더링합니다.</p>
        <pre className={styles.code}><code>{`import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      count: {count}
    </button>
  );
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) useEffect (중요)</h3>
        <p>
          렌더링 이후 실행되어 API 호출, 구독, 타이머 같은 부수 효과를 처리합니다.
          반환 함수는 cleanup(정리)로 언마운트/재실행 전에 호출됩니다.
        </p>
        <pre className={styles.code}><code>{`import { useEffect, useState } from 'react';

export default function Timer() {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSec(s => s + 1), 1000);
    return () => clearInterval(id); // cleanup
  }, []); // 마운트 시 1회

  return <p>{sec} sec</p>;
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) useMemo</h3>
        <p>비싼 계산 결과를 메모이즈해 불필요한 재계산을 줄입니다.</p>
        <pre className={styles.code}><code>{`import { useMemo, useState } from 'react';

function heavy(n) {
  let sum = 0;
  for (let i = 0; i < 1e7; i += 1) sum += i;
  return sum + n;
}

export default function HeavyCalc() {
  const [n, setN] = useState(1);
  const value = useMemo(() => heavy(n), [n]);
  return <button onClick={() => setN(n + 1)}>{value}</button>;
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>4) useRef</h3>
        <p>렌더링을 유발하지 않고 값을 저장하거나 DOM에 직접 접근할 때 사용합니다.</p>
        <pre className={styles.code}><code>{`import { useRef } from 'react';

export default function FocusInput() {
  const inputRef = useRef(null);
  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>focus</button>
    </>
  );
}`}</code></pre>
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
