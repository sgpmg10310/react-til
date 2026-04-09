import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

      <button className={styles.backBtn} onClick={() => navigate('/about')}>
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}