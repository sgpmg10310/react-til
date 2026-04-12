import { Link, useNavigate } from 'react-router-dom';
import styles from './VueSyntaxView.module.css';

export default function VueSyntaxView() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>💚 Vue 기본 문법 요약</h2>
      <p className={styles.desc}>React와 비교해 볼 수 있도록 Vue에서 가장 자주 사용하는 핵심 문법들을 정리했습니다.</p>

      <p className={styles.crossLink}>
        📊 <strong>React vs Vue</strong>를 항목별 표로 보려면{' '}
        <Link to="/basic-syntax">React 기본 문법</Link> 페이지 맨 아래 <strong>「5. React vs Vue 비교표」</strong>를 보세요.
      </p>

      <div className={styles.card}>
        <h3>1. 선언적 렌더링 (Mustache)</h3>
        <p>Vue는 이중 중괄호 <code>{`{{ }}`}</code>를 사용하여 데이터를 HTML에 바인딩합니다. (React의 <code>{`{ }`}</code>와 유사)</p>
        <pre><code>{`<span>메시지: {{ msg }}</span>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>2. 속성 바인딩 (v-bind)</h3>
        <p>HTML 속성에 동적인 값을 바인딩할 때는 <code>v-bind:</code> 또는 단축어인 <code>:</code>을 사용합니다.</p>
        <pre><code>{`<!-- 전체 문법 -->\n<div v-bind:id="dynamicId"></div>\n\n<!-- 단축 문법 -->\n<div :id="dynamicId"></div>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>3. 이벤트 리스너 (v-on)</h3>
        <p>DOM 이벤트를 수신할 때는 <code>v-on:</code> 또는 단축어인 <code>@</code>를 사용합니다.</p>
        <pre><code>{`<!-- 전체 문법 -->\n<button v-on:click="doSomething">클릭</button>\n\n<!-- 단축 문법 -->\n<button @click="doSomething">클릭</button>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>4. 양방향 바인딩 (v-model)</h3>
        <p>폼(Form) 엘리먼트와 상태를 양방향으로 묶을 때 <code>v-model</code>을 사용합니다. React의 <code>value</code>와 <code>onChange</code>를 합친 것과 같습니다.</p>
        <pre><code>{`<input v-model="text" placeholder="입력하세요">\n<p>입력한 텍스트: {{ text }}</p>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>5. 조건부 렌더링 (v-if, v-show)</h3>
        <p>조건에 따라 요소를 렌더링합니다. <code>v-if</code>는 DOM에서 요소를 완전히 제거/추가하며, <code>v-show</code>는 CSS의 <code>display</code> 속성만 변경합니다.</p>
        <pre><code>{`<div v-if="type === 'A'">A</div>\n<div v-else-if="type === 'B'">B</div>\n<div v-else>C</div>\n\n<h1 v-show="ok">안녕하세요!</h1>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>6. 리스트 렌더링 (v-for)</h3>
        <p>배열을 기반으로 리스트를 렌더링할 때 <code>v-for</code>를 사용합니다. 각 항목에는 고유한 <code>:key</code>를 반드시 제공해야 합니다.</p>
        <pre><code>{`<ul>\n  <li v-for="item in items" :key="item.id">\n    {{ item.message }}\n  </li>\n</ul>`}</code></pre>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/')}>
        🏠 메인으로 돌아가기
      </button>
    </div>
  );
}