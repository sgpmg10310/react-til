import { useMemo, useState } from 'react';

export default function HeavyCalc() {
  // 1부터 5까지 더한 값을 계산합니다.
  const sum = useMemo(() => {
    let s = 0;
    for (let i = 1; i <= 5; i++) {
      s += i;
    }
    return s;
  }, []); // 의존성 배열을 비워서 화면에 한 번만 계산

  return (
  <div>
  <div>1부터 5까지 더한 값: {sum}</div>
  <div>바보</div>
  </div>
  );
}
