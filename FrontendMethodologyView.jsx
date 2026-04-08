import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function FrontendMethodologyView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🧭 프론트엔드 개발 방법론: 스킬 & 하네스</h1>
        <p className={styles.description}>
          실무에서 기능 개발 전에 준비하면 품질이 올라가는 핵심 스킬과 테스트 하네스(검증 장치) 예제입니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 수행해야 하는 핵심 스킬</li>
          <li>2. 컴포넌트 테스트 하네스 예제</li>
          <li>3. API 모킹 하네스 예제(MSW)</li>
          <li>4. E2E 체크리스트 하네스</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 핵심 스킬 (개발 방법론 관점)</h3>
        <p>- 요구사항을 UI 상태(State)로 분해하고 우선순위화하기</p>
        <p>- 단일 책임 컴포넌트 설계(표현/로직 분리)</p>
        <p>- 비동기 상태(loading/error/success) 표준화</p>
        <p>- 테스트 가능한 구조(순수 함수, 의존성 주입, mock 포인트 확보)</p>
        <p>- 배포 전 체크리스트 자동화(lint, test, build)</p>
      </section>

      <section className={styles.section}>
        <h3>2) 컴포넌트 테스트 하네스 예제 (Vitest + Testing Library)</h3>
        <p>사용자 관점으로 렌더링/클릭/화면 변화를 검증합니다.</p>
        <pre className={styles.code}><code>{`// Counter.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';

test('click +1 increases count', async () => {
  render(<Counter />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /\\+1/i }));
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) API 모킹 하네스 예제 (MSW)</h3>
        <p>실제 서버 없이도 API 성공/실패 시나리오를 재현할 수 있습니다.</p>
        <pre className={styles.code}><code>{`// mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/todos', () => {
    return HttpResponse.json([{ id: 1, title: 'write tests' }]);
  }),
];

// test setup에서 server.listen/resetHandlers/close 적용`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>4) E2E 체크리스트 하네스</h3>
        <p>배포 전 "사용자 흐름"을 자동으로 확인하는 최소 규칙입니다.</p>
        <pre className={styles.code}><code>{`1. 로그인 성공/실패 시나리오
2. 목록 조회/빈 상태/에러 상태
3. 입력 폼 유효성 검사
4. 라우팅(직접 URL 접근 포함)
5. 모바일 해상도 레이아웃`}</code></pre>
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
