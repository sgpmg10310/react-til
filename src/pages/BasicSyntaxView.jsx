import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './BasicSyntaxView.module.css';

export default function BasicSyntaxView() {
  const navigate = useNavigate();

  // 조건부 렌더링을 위한 상태 (State)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 리스트 렌더링을 위한 데이터 배열
  const fruits = [
    { id: 1, name: '🍎 사과' },
    { id: 2, name: '🍌 바나나' },
    { id: 3, name: '🍇 포도' }
  ];

  // 이벤트 핸들링 테스트용 함수
  const handleButtonClick = (text) => {
    alert(`${text} 버튼을 클릭했습니다!`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📖 React 기본 문법</h2>
      <p className={styles.desc}>React 개발에 가장 많이 사용되는 핵심 문법들을 알아봅니다.</p>

      {/* 1. JSX 문법 */}
      <div className={styles.card}>
        <h3>1. JSX 문법 기초</h3>
        <p>React는 HTML과 JavaScript를 결합한 JSX 문법을 사용합니다.</p>
        <ul className={styles.list}>
          <li><code>class</code> 속성 대신 <strong><code>className</code></strong>을 사용합니다.</li>
          <li>인라인 스타일은 <strong>객체(Object)</strong> 형태로 작성하며, 카멜 케이스(camelCase) 속성명을 사용합니다.</li>
          <li>JavaScript 변수나 표현식을 화면에 그릴 때는 <strong>중괄호 <code>{`{}`}</code></strong> 안에 넣습니다.</li>
        </ul>
        <div className={styles.resultBox} style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '10px' }}>
          이 박스는 인라인 스타일(객체)이 적용되었습니다.
        </div>
      </div>

      {/* 2. 조건부 렌더링 */}
      <div className={styles.card}>
        <h3>2. 조건부 렌더링 (Conditional Rendering)</h3>
        <p>JavaScript의 논리 연산자(<code>&&</code>)나 삼항 연산자(<code>? :</code>)를 사용하여 조건에 따라 UI를 다르게 보여줍니다. (Vue의 v-if 대체)</p>
        <div className={styles.resultBox}>
          <p>현재 상태: <strong>{isLoggedIn ? '로그인됨 🔓' : '로그아웃됨 🔒'}</strong></p>
          
          {/* 삼항 연산자 예시: 조건에 따라 둘 중 하나를 렌더링 */}
          {isLoggedIn ? (
            <button className={styles.actionBtn} onClick={() => setIsLoggedIn(false)}>로그아웃 하기</button>
          ) : (
            <button className={styles.actionBtn} onClick={() => setIsLoggedIn(true)}>로그인 하기</button>
          )}
          
          {/* 논리 연산자(&&) 예시: 조건이 참일 때만 렌더링 */}
          {isLoggedIn && <p className={styles.notice}>환영합니다! 숨겨진 메시지가 보입니다.</p>}
        </div>
      </div>

      {/* 3. 리스트 렌더링 */}
      <div className={styles.card}>
        <h3>3. 리스트 렌더링 (List Rendering)</h3>
        <p>배열의 <code>map()</code> 함수를 사용하여 반복되는 컴포넌트나 엘리먼트를 렌더링합니다. 이때 각 요소에는 고유한 <strong><code>key</code></strong> 속성을 반드시 부여해야 합니다. (Vue의 v-for 대체)</p>
        <div className={styles.resultBox}>
          <ul className={styles.fruitList}>
            {fruits.map((fruit) => (
              // map을 사용할 때 최상위 엘리먼트에 무조건 key 값을 넣어주어야 렌더링 성능이 최적화됩니다.
              <li key={fruit.id}>{fruit.name}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. 이벤트 핸들링 */}
      <div className={styles.card}>
        <h3>4. 이벤트 핸들링 (Event Handling)</h3>
        <p>HTML과 달리 <code>onclick</code> 대신 카멜 케이스인 <strong><code>onClick</code></strong>을 사용하며, 문자열이 아닌 <strong>함수 자체</strong>를 전달합니다.</p>
        <div className={styles.buttonGroup}>
          {/* 인라인 화살표 함수 전달 */}
          <button className={styles.actionBtn} onClick={() => alert('직접 작성한 인라인 함수 실행!')}>
            인라인 화살표 함수
          </button>
          
          {/* 매개변수가 있는 외부 함수 호출 시에는 화살표 함수로 감싸서 전달해야 합니다. */}
          <button className={styles.actionBtn} onClick={() => handleButtonClick('매개변수가 있는 외부')}>
            외부 함수 호출 (매개변수 전달)
          </button>
        </div>
      </div>

      {/* React vs Vue 문법 비교 */}
      <div className={styles.card}>
        <h3>5. React vs Vue — 문법·개념 비교표</h3>
        <p className={styles.compareIntro}>
          같은 역할을 할 때 <strong>React</strong>와 <strong>Vue</strong>가 코드에서 어떻게 다른지 한눈에 보려고 정리했습니다.
          Vue 쪽 예시는 Options API / SFC 기준이며, Vue 3 <code>script setup</code>과도 대응됩니다.
        </p>
        <p className={styles.compareLinkRow}>
          <Link to="/vue-syntax" className={styles.inlineLink}>💚 Vue 기본 문법 요약 페이지</Link>와 함께 보면 좋아요.
        </p>
        <div className={styles.compareWrap} role="region" aria-label="React와 Vue 문법 비교 표">
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th scope="col" className={styles.colFeature}>항목</th>
                <th scope="col" className={styles.colReact}>React</th>
                <th scope="col" className={styles.colVue}>Vue</th>
                <th scope="col" className={styles.colNote}>차이·메모</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">화면 구조</th>
                <td><code>JSX</code> — JS 안에 XML 비슷한 문법. 파일 확장자는 보통 <code>.jsx</code> / <code>.tsx</code></td>
                <td><code>템플릿</code> — HTML에 디렉티브·중괄호. 단일 파일 컴포넌트 <code>.vue</code>의 <code>&lt;template&gt;</code></td>
                <td>Vue는 “HTML + 디렉티브”, React는 “JS 표현식 중심”으로 UI를 씁니다.</td>
              </tr>
              <tr>
                <th scope="row">값 출력</th>
                <td><code>{'{'} 변수 {'}'}</code> 중괄호 한 쌍</td>
                <td><code>{'{{'} 변수 {'}}'}</code> Mustache 두 쌍</td>
                <td>둘 다 표현식은 JS와 동일한 연산 규칙을 따릅니다.</td>
              </tr>
              <tr>
                <th scope="row"><code>class</code></th>
                <td>DOM 속성명은 <code>className</code> (JS 예약어 <code>class</code> 회피)</td>
                <td>템플릿에서는 그대로 <code>class</code>, 동적이면 <code>:class</code></td>
                <td>React만 JSX에서 <code>className</code>으로 씁니다.</td>
              </tr>
              <tr>
                <th scope="row">인라인 스타일</th>
                <td><code>style={'{{'} width: 10, backgroundColor: &apos;#fff&apos; {'}}'}</code> 객체 + 카멜케이스</td>
                <td><code>:style=&quot;obj&quot;</code> 또는 문자열 <code>style=&quot;width:10px&quot;</code></td>
                <td>React는 객체가 기본; Vue는 객체·문자열 모두 흔함.</td>
              </tr>
              <tr>
                <th scope="row">조건부 UI</th>
                <td><code>{'&&'}</code>, 삼항 <code>? :</code>, 또는 변수에 JSX 담기</td>
                <td><code>v-if</code> / <code>v-else-if</code> / <code>v-else</code>, 표시만 바꿀 땐 <code>v-show</code></td>
                <td><code>v-if</code>는 DOM 자체를 붙였다 뗐다; <code>v-show</code>는 CSS 표시만.</td>
              </tr>
              <tr>
                <th scope="row">리스트</th>
                <td><code>arr.map(item =&gt; &lt;li key=...&gt;...)</code> — JS 배열 메서드</td>
                <td><code>v-for=&quot;item in arr&quot; :key=&quot;...&quot;</code> — 템플릿 디렉티브</td>
                <td>둘 다 <strong>안정적인 <code>key</code></strong>가 중요합니다.</td>
              </tr>
              <tr>
                <th scope="row">이벤트</th>
                <td><code>onClick={'{'} fn {'}'}</code> 등 카멜케이스. 문자열이 아니라 <strong>함수 참조</strong></td>
                <td><code>@click=&quot;fn&quot;</code> 또는 <code>v-on:click</code></td>
                <td>React는 <code>onClick={'{'} () =&gt; do(a) {'}'}</code>처럼 인자 있을 때 래핑이 자주 나옵니다.</td>
              </tr>
              <tr>
                <th scope="row">폼 입력(양방향)</th>
                <td><code>value</code> + <code>onChange</code>로 직접 연결 (제어 컴포넌트)</td>
                <td><code>v-model</code> 한 방에 값 동기화</td>
                <td>Vue <code>v-model</code> ≈ React의 value/onChange를 문법으로 묶은 느낌.</td>
              </tr>
              <tr>
                <th scope="row">로컬 상태</th>
                <td><code>useState</code>, <code>useReducer</code> 등 Hooks</td>
                <td><code>data()</code>, <code>ref</code>, <code>reactive</code>, <code>script setup</code>의 <code>ref</code></td>
                <td>React는 함수 컴포넌트 + Hooks가 표준; Vue 3는 Composition / Options 선택.</td>
              </tr>
              <tr>
                <th scope="row">자식에 데이터 넘기기</th>
                <td><code>&lt;Child name=&quot;Kim&quot; /&gt;</code> → props 객체로 받음</td>
                <td><code>&lt;Child name=&quot;Kim&quot; /&gt;</code> → <code>props</code> / <code>defineProps</code></td>
                <td>개념은 동일(단방향 데이터 흐름).</td>
              </tr>
              <tr>
                <th scope="row">자식→부모 알림</th>
                <td>부모가 넘긴 <strong>콜백 함수</strong> props 호출</td>
                <td><code>emit(&apos;event&apos;, payload)</code> + 부모에서 <code>@event</code></td>
                <td>이름만 다르고 “부모가 듣는 함수”를 호출한다는 점은 같습니다.</td>
              </tr>
              <tr>
                <th scope="row">부수효과·구독</th>
                <td><code>useEffect(() =&gt; {'{'} ... return cleanup; {'}'}, [deps])</code></td>
                <td><code>watch</code>, <code>watchEffect</code>, <code>onMounted</code> 등 라이프사이클 / 반응형 API</td>
                <td>React는 “의존 배열”이 핵심; Vue는 “무엇을 감시할지” 선언이 분리되어 있음.</td>
              </tr>
              <tr>
                <th scope="row">여러 루트 노드</th>
                <td><code>&lt;&gt;...&lt;/&gt;</code> Fragment 또는 배열 반환</td>
                <td>Vue 3는 템플릿에 루트 여러 개 가능. Vue 2는 단일 루트 필요</td>
                <td>Vue 2만 제약이 있었고, Vue 3는 React와 비슷하게 유연.</td>
              </tr>
              <tr>
                <th scope="row">“HTML용 문법 설탕”</th>
                <td>없음 — 조건·반복은 그냥 JavaScript</td>
                <td><code>v-if</code>, <code>v-for</code>, <code>v-bind</code>, <code>v-on</code>, <code>v-slot</code> 등 디렉티브</td>
                <td>Vue는 템플릿 전용 축약 문법이 많고, React는 JS로 풀어 씁니다.</td>
              </tr>
              <tr>
                <th scope="row">라우팅(참고)</th>
                <td><code>react-router-dom</code> — <code>&lt;Routes&gt;</code>, <code>&lt;Route&gt;</code>, <code>useNavigate</code></td>
                <td><code>vue-router</code> — <code>router-view</code>, <code>createRouter</code></td>
                <td>역할은 같고 API 이름만 다릅니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/about')}>
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}