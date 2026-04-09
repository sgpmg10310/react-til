import React from 'react';
import useCounterStore from './store/store'; // 1번에서 만든 스토어 임포트

function Apptest() {
  // 스토어에서 필요한 상태와 함수만 쏙 골라옵니다.
  const { count, increase, decrease } = useCounterStore();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Zustand 카운터</h1>
      <div style={{ fontSize: '2rem', marginBottom: '20px' }}>
        현재 숫자: <strong>{count}</strong>
      </div>
      
      <button onClick={increase} style={{ marginRight: '10px' }}>
        증가 (+1)
      </button>
      <button onClick={decrease}>
        감소 (-1)
      </button>
    </div>
  );
}

export default Apptest;