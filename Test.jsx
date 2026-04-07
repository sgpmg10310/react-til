// React를 사용하기 위해 import 합니다.
import React from 'react';
import { useState } from 'react'
import Child from './Child';


export default function Test() {
  const [count, setCount] = useState(0);
  const [otherState, setOtherState] = useState(0);

  // 부모가 리렌더링될 때마다 이 함수는 '새로운 함수'가 됩니다.
  const increment = () => {
    console.log("새로운 함수처럼 다시 호출");
    setCount(prev => prev + 1)
  };

  return (
    <div>
      <button onClick={() => setOtherState(otherState + 1)}>부모 상태 변경</button>
      <p>부모 숫자: {otherState}</p>
      <Child onClick={increment} />
    </div>
  );
}