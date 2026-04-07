import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CallbackTestView.module.css';

// ==========================================
// [자식 컴포넌트]
// React.memo: 부모가 리렌더링되어도 넘겨받은 props(onClick, name)가 
// 이전과 완전히 똑같다면 리렌더링을 건너뜁니다.
// ==========================================
const ChildButton = React.memo(({ onClick, name }) => {
  console.log(`[렌더링 됨] 🔄 ${name} 버튼이 다시 그려졌습니다!`);
  return <button className={styles.btn} onClick={onClick}>{name} 버튼 (+1)</button>;
});

// 💡 [꼼수] 메모리 주소(참조값)가 진짜로 다른지 확인하기 위한 Set 객체 (컴포넌트 외부에 선언)
// Set은 중복된 값을 허용하지 않으므로, 동일한 메모리 주소면 크기가 안 변하고, 새로운 주소면 크기가 늘어납니다.
const normalFuncSet = new Set();
const callbackFuncSet = new Set();

export default function CallbackTestView() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [count, setCount] = useState(0);

  // 🚨 [일반 함수] 
  // 부모(CallbackTestView)가 리렌더링될 때마다 매번 새로운 메모리 주소를 가진 함수로 다시 태어납니다.
  const handleNormalClick = () => {
    setCount((prev) => prev + 1);
  };

  // ✅ [useCallback 함수]
  // 컴포넌트가 처음 만들어질 때 한 번만 생성되고, 이후에는 그 메모리 주소를 계속 기억해서 재사용합니다.
  const handleCallbackClick = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  // 렌더링이 될 때마다 지금 들고 있는 함수를 Set 주머니에 던져 넣어봅니다.
  normalFuncSet.add(handleNormalClick);
  callbackFuncSet.add(handleCallbackClick);

  return (
    <div className={styles.container}>
      <h2>🎯 초간단 useCallback 테스트</h2>
      <p>F12를 눌러 콘솔창을 켜고, 아래 입력창에 글자를 마구 입력해 보세요!</p>

      <div className={styles.inputBox}>
        <label>글자를 입력하면 부모 컴포넌트가 리렌더링됩니다 👇</label>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="아무 글자나 타이핑 해보세요"
        />
      </div>

      <div className={styles.resultBox}>
        <h3>현재 카운트: {count}</h3>
        <div className={styles.buttonGroup}>
          <ChildButton name="[일반]" onClick={handleNormalClick} />
          <ChildButton name="[useCallback]" onClick={handleCallbackClick} />
        </div>
      </div>

      {/* 👇 화면에 생성 횟수를 직접 보여주는 코드를 추가합니다! 👇 */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'left', border: '1px dashed #94a3b8' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>🧠 메모리 주소 생성 횟수 (Set Size)</h4>
        <p style={{ margin: '5px 0' }}>🚨 [일반] 새로 만들어진 횟수: <strong style={{ color: '#ef4444', fontSize: '1.2rem' }}>{normalFuncSet.size}</strong>번</p>
        <p style={{ margin: '5px 0' }}>✅ [useCallback] 새로 만들어진 횟수: <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>{callbackFuncSet.size}</strong>번</p>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/')}>🏠 메인으로 가기</button>
    </div>
  );
}