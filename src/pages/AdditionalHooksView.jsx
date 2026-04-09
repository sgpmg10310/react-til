import React, { useState, useReducer, useLayoutEffect, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdditionalHooksView.module.css';

// ==========================================
// 1. useReducer를 위한 Reducer 함수 정의
// 현재 상태(state)와 액션(action) 객체를 받아 새로운 상태를 반환하는 순수 함수입니다.
// Vuex의 mutations/actions와 유사한 역할을 합니다.
// ==========================================
const counterReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
    case 'RESET':
      return { count: 0 };
    case 'SET_VALUE':
      return { count: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default function AdditionalHooksView() {
  const navigate = useNavigate();

  // ==========================================
  // 1. useReducer: 복잡한 상태 로직 관리
  // const [state, dispatch] = useReducer(reducer, initialState);
  // useState의 대체재. 여러 하위 값을 포함하는 복잡한 state 로직을 다룰 때 유용합니다.
  // dispatch 함수를 통해 상태 변경을 "요청"합니다.
  // ==========================================
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  const [inputValue, setInputValue] = useState(0);

  // ==========================================
  // 2. useLayoutEffect: 동기적 부수 효과
  // useEffect와 거의 동일하지만, 모든 DOM 변경 후에 '동기적으로' 실행됩니다.
  // 브라우저가 화면을 그리기(paint) 전에 실행되므로, DOM을 측정하거나 스타일에 따라 동기적으로 리렌더링할 때 사용됩니다.
  // 잘못 사용하면 성능 저하를 일으킬 수 있어, 대부분의 경우 useEffect로 충분합니다.
  // ==========================================
  const [layoutValue, setLayoutValue] = useState(0);
  const layoutRef = useRef(null);

  useEffect(() => {
    // 일반적인 useEffect는 화면이 렌더링된 '후에' 비동기적으로 실행됩니다.
    console.log('[useEffect] 실행: 화면 렌더링 완료 후');
  }, [layoutValue]);

  useLayoutEffect(() => {
    // useLayoutEffect는 화면이 렌더링되기 '전에' 동기적으로 실행됩니다.
    console.log('[useLayoutEffect] 실행: DOM 변경 후, 브라우저 페인트 전');
    if (layoutValue > 0) {
      // 예시: DOM의 크기나 위치를 측정하고, 그 값에 따라 무언가를 변경할 때 유용합니다.
      console.log('측정된 div 너비:', layoutRef.current.getBoundingClientRect().width);
    }
  }, [layoutValue]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📚 추가 Hooks (useReducer, useLayoutEffect)</h2>
      <p className={styles.desc}>상태 관리와 렌더링 제어에 관련된 추가적인 Hooks를 알아봅니다.</p>

      <div className={styles.card}>
        <h3>1. useReducer: 복잡한 상태를 위한 상태 관리자</h3>
        <p>
          <code>useState</code>와 비슷하지만, 상태 변경 로직(reducer)이 컴포넌트 밖으로 분리되어 있어<br/>
          복잡한 상태 업데이트를 더 체계적으로 관리할 수 있습니다. (Vuex와 유사한 패턴)
        </p>
        <div className={styles.resultBox}>
          현재 카운트: <strong>{state.count}</strong>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.actionBtn} onClick={() => dispatch({ type: 'INCREMENT' })}>증가 (+)</button>
          <button className={styles.actionBtn} onClick={() => dispatch({ type: 'DECREMENT' })}>감소 (-)</button>
          <button className={styles.actionBtn} onClick={() => dispatch({ type: 'RESET' })}>초기화</button>
        </div>
        <div className={styles.inputGroup}>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(parseInt(e.target.value, 10) || 0)}
            className={styles.textInput}
          />
          <button className={styles.actionBtn} onClick={() => dispatch({ type: 'SET_VALUE', payload: inputValue })}>값 설정</button>
        </div>
      </div>

      <div className={styles.card}>
        <h3>2. useLayoutEffect: 동기적 렌더링 효과</h3>
        <p><code>useEffect</code>와 거의 동일하지만, 브라우저가 화면을 그리기 전에 동기적으로 실행됩니다.<br/>아래 버튼을 누르고 콘솔 창의 로그 실행 순서를 확인해 보세요.</p>
        <div ref={layoutRef} className={styles.resultBox}>값: {layoutValue}</div>
        <button className={styles.actionBtn} onClick={() => setLayoutValue(prev => prev + 1)}>값 변경 (콘솔 확인)</button>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/about')}>⬅️ 목록으로 돌아가기</button>
    </div>
  );
}