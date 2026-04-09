// React를 사용하기 위해 import 합니다.
import React from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Child from './Child';
import styles from './test.module.css';

export default function Test() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // 부모가 리렌더링될 때마다 이 함수는 '새로운 함수'가 됩니다.
  const increment = () => {
    setCount(prev => prev + 1)
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧪 컴포넌트 렌더링 테스트</h2>
      <p className={styles.desc}>
        <strong>React.memo</strong>가 적용된 자식 컴포넌트라도, 부모로부터 전달받는 <strong>함수(Prop)가 매번 새로 만들어지면</strong> 리렌더링을 막을 수 없다는 것을 테스트합니다.
      </p>

      <div className={styles.card}>
        <h3>테스트 방법 (F12 콘솔 확인)</h3>
        <ul style={{ color: '#475569', lineHeight: '1.6' }}>
          <li>아래 <strong>'부모 상태 변경'</strong> 버튼을 누르면 부모 컴포넌트가 리렌더링됩니다.</li>
          <li>이때 <code>increment</code> 함수가 새로 만들어지며 자식에게 전달됩니다.</li>
          <li>자식 컴포넌트는 <code>React.memo</code>로 감싸져 있지만, 전달받은 함수(onClick)의 <strong>메모리 주소가 달라졌기 때문에</strong> 결국 리렌더링 로그를 찍게 됩니다.</li>
        </ul>
        
        <div style={{ padding: '15px', backgroundColor: '#fef3c7', borderRadius: '8px', marginBottom: '15px' }}>
          <p>부모 숫자 (otherState): <strong>{otherState}</strong></p>
          <button className={styles.actionBtn} onClick={() => setOtherState(otherState + 1)}>부모 상태 변경</button>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
          <p>자식 카운트 제어용 (count): <strong>{count}</strong></p>
          {/* Child 컴포넌트에 함수를 전달합니다 */}
          <Child name="👶 자식 컴포넌트" onClick={increment} />
        </div>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/')}>🏠 메인으로 가기</button>
    </div>
  );
}