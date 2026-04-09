import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './InfiniteScrollRefreshLabView.module.css';

const PAGE_SIZE = 12;
const TOTAL = 72;

function makeDataset() {
  return Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    title: `토스 스타일 피드 카드 #${i + 1}`,
    body: `스크롤 UX 연습용 더미 데이터입니다. 아이템 번호: ${i + 1}`,
  }));
}

export default function InfiniteScrollRefreshLabView() {
  const dataset = useMemo(() => makeDataset(), []);
  const [items, setItems] = useState(dataset.slice(0, PAGE_SIZE));
  const [page, setPage] = useState(1);
  const [refreshAt, setRefreshAt] = useState(new Date().toLocaleTimeString());
  const sentinelRef = useRef(null);
  const hasMore = items.length < dataset.length;

  useEffect(() => {
    if (!hasMore) return undefined;
    const observer = new IntersectionObserver(
      entries => {
        if (!entries[0].isIntersecting) return;
        setPage(prev => {
          const nextPage = prev + 1;
          setItems(dataset.slice(0, nextPage * PAGE_SIZE));
          return nextPage;
        });
      },
      { rootMargin: '120px' },
    );

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dataset, hasMore]);

  const refreshFeed = () => {
    setPage(1);
    setItems(dataset.slice(0, PAGE_SIZE));
    setRefreshAt(new Date().toLocaleTimeString());
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>∞ 무한 스크롤 + 새로고침 실습</h1>
        <p className={styles.subtitle}>
          토스 피드처럼 아래로 내리면 자동 로드되고, 상단 버튼으로 즉시 새로고침 됩니다.
        </p>
      </header>

      <div className={styles.topBar}>
        <p className={styles.meta}>마지막 새로고침: {refreshAt} / 현재 page: {page}</p>
        <button className={styles.refreshBtn} onClick={refreshFeed}>새로고침</button>
      </div>

      <section className={styles.feed}>
        {items.map(item => (
          <article key={item.id} className={styles.card}>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <div ref={sentinelRef} className={styles.sentinel}>
        {hasMore ? '아래로 내리면 더 불러옵니다...' : '모든 데이터를 불러왔습니다.'}
      </div>

      <section className={styles.codeSection}>
        <h3>핵심 구현 코드 예제</h3>
        <pre className={styles.codeBlock}><code>{`// 1) 무한 스크롤: IntersectionObserver
useEffect(() => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) loadMore();
  }, { rootMargin: '120px' });
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, []);`}</code></pre>

        <pre className={styles.codeBlock}><code>{`// 2) 새로고침: 상태 초기화
const refreshFeed = () => {
  setPage(1);
  setItems(dataset.slice(0, PAGE_SIZE));
  setRefreshAt(new Date().toLocaleTimeString());
};`}</code></pre>
      </section>

      <Link to="/about">← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
