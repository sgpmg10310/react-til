import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function FirebaseFrontendBootView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔥 Firebase로 백엔드 없이 프론트 서비스 만들기</h1>
        <p className={styles.description}>
          Firebase 기본 설치부터 Auth/Firestore/Hosting까지 최소 구성으로 빠르게 서비스 만드는 방법입니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 설치/초기화</li>
          <li>2. Auth + Firestore 기본 사용</li>
          <li>3. 예제: 간단 메모 앱</li>
          <li>4. DB 서버 없이 운영할 때 팁</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 설치/초기화</h3>
        <pre className={styles.code}><code>{`npm install firebase

// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) Auth + Firestore 기본</h3>
        <pre className={styles.code}><code>{`import { signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from './firebase';

await signInWithEmailAndPassword(auth, email, password);
await addDoc(collection(db, 'notes'), {
  title: '첫 메모',
  createdAt: Date.now(),
});`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) 예제 구조 (DB 서버 없이)</h3>
        <p>- 프론트: React (폼, 목록, 상태)</p>
        <p>- 인증: Firebase Auth</p>
        <p>- 데이터: Firestore</p>
        <p>- 파일: Firebase Storage (선택)</p>
        <p>- 배포: Firebase Hosting 또는 GitHub Pages + Firebase</p>
      </section>

      <section className={styles.section}>
        <h3>4) 운영 팁</h3>
        <p>- Firestore Security Rules를 먼저 작성</p>
        <p>- 클라이언트 키는 공개 가능하지만, 규칙으로 접근 제어 필수</p>
        <p>- 읽기/쓰기 횟수 기반 과금이므로 쿼리/구독 최소화</p>
      </section>

      <Link to="/about" className={styles.backLink}>← 문법 학습 허브로 돌아가기</Link>
    </div>
  );
}
