import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdvancedHooksView.module.css';
// ==========================================
// useCallback 예제를 위한 자식 컴포넌트
// React.memo: 부모 컴포넌트가 리렌더링 되어도, 받는 props가 변경되지 않으면
// 이 컴포넌트는 리렌더링되지 않도록 막아줍니다. (성능 최적화)
// ==========================================
const CountButton = React.memo(({ onClick, label }) => {
  // 이 로그는 버튼이 실제로 다시 그려질 때만 콘솔에 나타납니다.
  console.log(`[Render] ${label} 버튼이 렌더링되었습니다.`);
  return <button className={styles.actionBtn} onClick={onClick}>+1</button>;
});

// ==========================================
// 실전 종합 예제를 위한 자식 컴포넌트
// ==========================================
const UserListItem = React.memo(({ user, onDelete, type }) => {
  console.log(`[Render] 👤 ${type} 유저 아이템 렌더링: ${user.name}`);
  return (
    <li className={styles.userListItem}>
      {user.name} <button className={styles.deleteBtn} onClick={() => onDelete(user.id)}>삭제</button>
    </li>
  );
});

export default function AdvancedHooksView() {
  const navigate = useNavigate();

  // useRef 예제용 상태
  const inputRef = useRef(null);

  // useMemo 예제용 상태들
  const [number, setNumber] = useState(0);
  const [isDark, setIsDark] = useState(false);

  // useCallback 예제용 상태들
  const [count1, setCount1] = useState(0);
  const [countB, setCountB] = useState(0);

  // 실전 종합 예제용 상태들
  const [users, setUsers] = useState([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ]);
  const [search, setSearch] = useState('');

  // ==========================================
  // 1. useRef: DOM 요소 직접 참조 또는 값 저장
  // 리렌더링을 발생시키지 않고 값을 저장하고 싶을 때 사용합니다.
  // Vue에서는 <template ref="input">과 비슷하게 DOM을 참조할 수 있습니다.
  // ==========================================
  const handleFocus = () => {
    // inputRef.current는 실제 input DOM 요소를 가리킵니다.
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // ==========================================
  // 2. useMemo: 값(value)을 메모이제이션(기억)
  // 복잡하고 무거운 연산의 결과를 캐싱하여, 의존성 배열의 값이 변경될 때만
  // 다시 계산하도록 합니다. (Vue의 computed와 매우 유사)
  // ==========================================
  const heavyCalculation = (num) => {
    console.log('😱 엄청 오래 걸리는 함수 실행 중...');
    for (let i = 0; i < 1000000000; i++) {} // 시간 지연용 루프
    return num * 2;
  };

  // 'number' 상태가 변경될 때만 heavyCalculation 함수가 실행됩니다.
  // '테마 변경' 버튼을 눌러 isDark 상태가 바뀌고 컴포넌트가 리렌더링 되어도, 이 부분은 다시 계산되지 않습니다.
  const doubleNumber = useMemo(() => {
    return heavyCalculation(number);
  }, [number]);

  // ==========================================
  // 3. useCallback: 함수(function)를 메모이제이션(기억)
  // 자식 컴포넌트에 함수를 props로 넘길 때, 부모가 리렌더링 되어도
  // 그 함수가 불필요하게 재생성되는 것을 막아줍니다.
  // React.memo와 함께 사용해야 최적화 효과가 있습니다.
  // ==========================================

  // useCallback으로 감싸진 함수: 의존성 배열이 비어있으므로, 컴포넌트가 처음 렌더링될 때 단 한 번만 생성되고 이후에는 계속 재사용됩니다.
  const incrementB = useCallback(() => {
    setCountB(prev => prev + 1);
    console.log("useCallBack 실행")
  }, []);

  // 일반 함수: 부모 컴포넌트(AdvancedHooksView)가 리렌더링될 때마다 매번 새로운 함수로 다시 생성됩니다.
  const incrementA = () => {
    setCount1(prev => prev + 1);
    console.log("그냥 함수 실행")
  };

  // ==========================================
  // 4. 실전 예제: 리스트 필터링(useMemo) & 아이템 삭제(useCallback)
  // ==========================================
  
  // users나 search 상태가 바뀔 때만 필터링 연산을 다시 수행합니다. (테마 변경 시에는 재실행 안 됨)
  const filteredUsers = useMemo(() => {
    console.log('🔍 유저 검색 필터링 실행 중...');
    return users.filter(user => user.name.toLowerCase().includes(search.toLowerCase()));
  }, [users, search]);

  // [전] 일반 함수: 부모 컴포넌트가 리렌더링 될 때마다 함수가 새로 생성됨 (참조값 변경)
  const handleBadDeleteUser = (id) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  };

  // [후] useCallback 함수: 의존성 배열이 바뀌지 않는 한 기존 함수 참조를 유지함
  const handleGoodDeleteUser = useCallback((id) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>⚙️ 심화 Hooks (useRef, useMemo, useCallback)</h2>
      <p className={styles.desc}>성능 최적화와 관련된 주요 Hooks의 사용법을 알아봅니다.</p>

      <div className={styles.card}>
        <h3>1. useRef: DOM 요소에 직접 접근하기</h3>
        <input ref={inputRef} type="text" placeholder="여기에 포커스를 맞춰보세요" className={styles.textInput} />
        <button className={styles.actionBtn} onClick={handleFocus}>Focus Input</button>
      </div>

      <div className={styles.card} style={{ backgroundColor: isDark ? '#282c34' : 'white', color: isDark ? 'white' : 'black' }}>
        <h3>2. useMemo: 계산 결과 값(value) 재사용하기</h3>
        <p>테마를 변경해도 '오래 걸리는 함수'는 다시 실행되지 않습니다. (콘솔 확인)</p>
        <button className={styles.actionBtn} onClick={() => setIsDark(!isDark)}>
          테마 변경
        </button>
        <hr />
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
          className={styles.textInput}
        />
        <p className={styles.result}>오래 걸리는 계산 결과: <strong>{doubleNumber}</strong></p>
      </div>

      <div className={styles.card}>
        <h3>3. useCallback: 함수 재사용 및 자식 컴포넌트 최적화</h3>
        <p>
          아래 입력창에 글자를 입력하면 부모 컴포넌트가 리렌더링됩니다. <br/>
          <code>useCallback</code>이 적용되지 않은 왼쪽 버튼은 계속 리렌더링되지만, 오른쪽 버튼은 그렇지 않습니다. (콘솔 확인)
        </p>
        <input type="text" placeholder="리렌더링 유발용 입력창" className={styles.textInput} onChange={() => {}} />
        <div className={styles.buttonGroup}>
          <div>
            <p>Count A: {count1}</p>
            <CountButton onClick={incrementA} label="일반 함수 버튼" />
          </div>
          <div>
            <p>Count B: {countB}</p>
            <CountButton onClick={incrementB} label="useCallback 버튼" />
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h3>4. 실전 종합 예제 (최적화 전/후 비교)</h3>
        <p>
          아래 <strong>'테마 변경'</strong> 버튼을 누르거나 <strong>검색창</strong>에 입력하여 리렌더링을 발생시켜 보세요.<br/>
          <code>React.memo</code>가 적용된 자식 컴포넌트라도, 부모가 매번 새로운 함수를 만들어 넘겨주면 불필요한 리렌더링이 발생합니다.
        </p>
        <input 
          type="text" 
          placeholder="유저 이름 검색..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.textInput}
        />
        <div className={styles.listContainer}>
          <div className={styles.listWrapper}>
            <h4>🚨 최적화 전 (일반 함수)</h4>
            <ul className={styles.userList}>
              {filteredUsers.map(user => (
                <UserListItem key={`bad-${user.id}`} user={user} onDelete={handleBadDeleteUser} type="[최적화 전]" />
              ))}
            </ul>
          </div>
          <div className={styles.listWrapper}>
            <h4>✅ 최적화 후 (useCallback)</h4>
            <ul className={styles.userList}>
              {filteredUsers.map(user => (
                <UserListItem key={`good-${user.id}`} user={user} onDelete={handleGoodDeleteUser} type="[최적화 후]" />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/about')}>
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}