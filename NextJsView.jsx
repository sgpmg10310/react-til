import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function NextJsView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>⚫ Next.js 세부 문법</h1>
        <p className={styles.description}>
          Next.js는 React 기반 풀스택 프레임워크로, 파일 기반 라우팅과 서버 렌더링을 쉽게 제공합니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. App Router 페이지 구조</li>
          <li>2. 서버 컴포넌트 데이터 패칭</li>
          <li>3. API Route 핸들러</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) App Router 페이지 구조</h3>
        <p>`app` 디렉터리의 폴더 구조가 URL이 됩니다.</p>
        <pre className={styles.code}><code>{`// app/posts/page.tsx
export default function PostsPage() {
  return <h1>Posts</h1>;
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) 서버 컴포넌트 데이터 패칭</h3>
        <p>서버에서 fetch 후 바로 JSX를 반환할 수 있습니다.</p>
        <pre className={styles.code}><code>{`export default async function Page() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store',
  });
  const posts = await res.json();
  return <main>{posts.length} posts</main>;
}`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) API Route 핸들러</h3>
        <p>백엔드 엔드포인트를 같은 프로젝트 안에 만들 수 있습니다.</p>
        <pre className={styles.code}><code>{`// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello from Next.js' });
}`}</code></pre>
      </section>

      <Link to="/" className={styles.backLink}>← 홈으로 돌아가기</Link>
    </div>
  );
}
