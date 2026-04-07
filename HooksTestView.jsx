import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HooksTestView.module.css';

export default function HooksTestView() {
  const navigate = useNavigate();

  // ==========================================
  // 1. useState: 상태 관리
  // Vue의 ref(), reactive() 와 동일한 역할을 합니다.
  // 배열의 첫 번째 요소는 상태 값, 두 번째 요소는 상태를 변경하는 함수입니다.
  // ==========================================
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  const [name, setName ] = useState('박명근');

  // ==========================================
  // 2. useEffect: 부수 효과(Side Effect) 및 생명주기 관리
  // Vue의 onMounted, onUpdated, onUnmounted, watch 역할을 모두 수행할 수 있습니다.
  // ==========================================

  // [Case A] 의존성 배열이 빈 배열 '[]'인 경우: 
  // 처음 화면에 나타날 때(Mount) 단 한 번만 실행됩니다. (Vue의 onMounted와 동일)
  useEffect(() => {
    console.log('✅ [Mount] 컴포넌트가 처음 렌더링되었습니다.');

    // useEffect 안에서 함수를 return 하면, 컴포넌트가 사라질 때(Unmount) 실행됩니다. (Vue의 onUnmounted와 동일)
    return () => {
      console.log('❌ [Unmount] 컴포넌트가 화면에서 사라집니다.');
    };
  }, []); // 의존성 배열(Dependency Array)이 비어있음

  // [Case B] 의존성 배열에 특정 상태가 있는 경우:
  // 해당 상태가 변경될 때마다 실행됩니다. (Vue의 watch와 동일)
  useEffect(() => {
    console.log(`🔄 [Update] count가 ${count}로 변경되었습니다.`);
  }, [count]); // count가 바뀔 때만 실행

  // [Case C] 의존성 배열이 아예 없는 경우:
  // 컴포넌트의 어떤 상태든 변경되어 리렌더링 될 때마다 매번 실행됩니다. (Vue의 onUpdated와 비슷하지만 다소 다름, 주의해서 사용 필요)
  useEffect(() => {
    console.log(`⚡ [Any Update] 무언가 변경되어 렌더링되었습니다.`);
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🪝 React Hooks 실전 테스트</h2>
      <p className={styles.desc}>F12를 눌러 개발자 도구의 콘솔 창을 열고 동작을 확인해 보세요!</p>

      <div className={styles.card}>
        <h3>1. useState 테스트 (상태 변경)</h3>
        <div className={styles.counterBox}>
          <p>현재 카운트: <strong>{count}</strong></p>
          <button className={styles.actionBtn} onClick={() => setCount(count + 1)}>
            카운트 증가 (+1)
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h3>2. useEffect & useState 연동 (Watch 대체)</h3>
        <div className={styles.inputBox}>
          <p>텍스트를 입력할 때는 <code>count</code>를 감시하는 <code>useEffect</code>는 실행되지 않습니다.</p>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="아무 글자나 입력해보세요."
            className={styles.textInput}
          />
        </div>
      </div>

      <div>
        <button className={styles.actionBtn} onClick={() => setName(name+ "바보")}>
           {name}
          </button>
      </div>


      <button className={styles.backBtn} onClick={() => navigate('/about')}>
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}