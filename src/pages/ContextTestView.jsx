import { useNavigate } from 'react-router-dom';
// 우리가 만든 커스텀 훅을 불러옵니다.
import { useTheme } from '@/contexts/ThemeContext';
import styles from './ContextTestView.module.css';

// ==========================================
// 3. 손자 컴포넌트 (GrandChildComponent)
// ==========================================
function GrandChildComponent() {
  // useTheme() 훅을 호출하여 theme과 toggleTheme 함수를 직접 가져옵니다.
  // 중간 컴포넌트들(ParentComponent)을 거치지 않고 바로 상태를 사용할 수 있습니다.
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.box}>
      <h4>👶 손자 컴포넌트</h4>
      <p>현재 테마는? <strong>{theme}</strong></p>
      <button onClick={toggleTheme}>테마 변경하기</button>
    </div>
  );
}

// ==========================================
// 2. 자식 컴포넌트 (ParentComponent)
// ==========================================
function ParentComponent() {
  // 이 컴포넌트는 테마 관련 props를 전혀 받지 않습니다.
  // 그저 손자 컴포넌트를 렌더링하는 역할만 합니다.
  return (
    <div className={styles.box}>
      <h3>🧑‍🦰 자식 컴포넌트</h3>
      <p>저는 테마가 뭔지 몰라요. 그냥 손자에게 전달만 할 뿐...</p>
      <GrandChildComponent />
    </div>
  );
}

// ==========================================
// 1. 최상위 컴포넌트 (ContextTestView)
// ==========================================
export default function ContextTestView() {
  const navigate = useNavigate();
  // useTheme 훅을 사용하여 현재 테마 값을 가져옵니다.
  const { theme } = useTheme();

  // 동적으로 클래스 이름을 적용하여 배경색을 변경합니다.
  const containerClassName = `${styles.container} ${theme === 'dark' ? styles.dark : styles.light}`;

  return (
    <div className={containerClassName}>
      <div className={styles.header}>
        <h2 className={styles.title}>🌐 Context API 실전 테스트 (useContext)</h2>
        <p className={styles.desc}>
          'Props Drilling' 없이 깊이 중첩된 컴포넌트 간에 상태를 공유하는 방법을 알아봅니다.
        </p>
      </div>

      <div className={styles.card}>
        <h3>👵 최상위 컴포넌트</h3>
        <p>
          <code>ThemeProvider</code>가 앱 전체를 감싸고 있으므로, <br />
          어디서든 <code>useTheme()</code> 훅을 통해 테마 상태와 변경 함수에 접근할 수 있습니다.
        </p>
        <ParentComponent />
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/about')}>
        ⬅️ 목록으로 돌아가기
      </button>
    </div>
  );
}