import { Link } from 'react-router-dom';
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import styles from './ZustandReactQueryLabView.module.css';

const useCounterStore = create(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 })),
  decrease: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

async function fetchTodos() {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
  if (!res.ok) {
    throw new Error('할 일 목록을 가져오지 못했습니다.');
  }
  return res.json();
}

export default function ZustandReactQueryLabView() {
  const { count, increase, decrease, reset } = useCounterStore();
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['todos', 5],
    queryFn: fetchTodos,
    staleTime: 1000 * 30,
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧪 Zustand + React Query 테스트 창</h2>
      <p className={styles.subtitle}>
        Zustand는 클라이언트 전역 상태를, React Query는 서버 상태를 관리합니다.
      </p>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h3>1) Zustand 전역 상태 예제</h3>
          <p>페이지를 이동해도 같은 스토어를 공유하는 카운터입니다.</p>
          <div className={styles.counter}>{count}</div>
          <div className={styles.row}>
            <button className={styles.btn} onClick={increase}>+1</button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={decrease}>-1</button>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={reset}>Reset</button>
          </div>
        </section>

        <section className={styles.card}>
          <h3>2) React Query 서버 상태 예제</h3>
          <p className={styles.status}>
            상태: {isLoading ? '초기 로딩 중' : isFetching ? '백그라운드 갱신 중' : '완료'}
          </p>
          <div className={styles.row}>
            <button className={styles.btn} onClick={() => refetch()}>다시 가져오기</button>
          </div>
          {isError && <p>에러: {error.message}</p>}
          {!isError && (
            <ul className={styles.list}>
              {(data || []).map(todo => (
                <li key={todo.id}>{todo.title}</li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className={styles.miniToc}>
        <strong>학습 포인트</strong>
        <ul className={styles.list}>
          <li>Zustand: `create()`로 스토어 생성, 액션으로 상태 변경</li>
          <li>React Query: `useQuery`로 API 캐싱/로딩/에러 처리 자동화</li>
          <li>역할 분리: 로컬 UI 상태와 서버 상태를 분리해 유지보수성 향상</li>
        </ul>
      </div>

      <Link to="/about" className={styles.back}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
