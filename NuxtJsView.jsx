import { Link } from 'react-router-dom';
import styles from './TopicDetailView.module.css';

export default function NuxtJsView() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>💚 Nuxt.js 세부 문법</h1>
        <p className={styles.description}>
          Nuxt.js는 Vue 생태계의 풀스택 프레임워크로 라우팅, SSR, API 통신 패턴을 표준화합니다.
        </p>
      </header>

      <section className={styles.toc}>
        <h2>목차</h2>
        <ul>
          <li>1. 파일 기반 라우팅</li>
          <li>2. useFetch 데이터 가져오기</li>
          <li>3. 컴포저블(composable) 분리</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h3>1) 파일 기반 라우팅</h3>
        <p>`pages` 폴더 파일명이 경로가 됩니다.</p>
        <pre className={styles.code}><code>{`// pages/posts.vue
<template>
  <h1>Posts Page</h1>
</template>`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>2) useFetch 데이터 가져오기</h3>
        <p>SSR에서도 동작하는 데이터 패칭 훅을 제공합니다.</p>
        <pre className={styles.code}><code>{`<script setup lang="ts">
const { data, pending, error } = await useFetch('/api/posts');
</script>`}</code></pre>
      </section>

      <section className={styles.section}>
        <h3>3) 컴포저블로 로직 분리</h3>
        <p>재사용 로직을 `composables`로 빼서 관리합니다.</p>
        <pre className={styles.code}><code>{`// composables/useAuth.ts
export const useAuth = () => {
  const token = useCookie('token');
  const isLogin = computed(() => !!token.value);
  return { token, isLogin };
};`}</code></pre>
      </section>

      <Link to="/" className={styles.backLink}>← 홈으로 돌아가기</Link>
    </div>
  );
}
