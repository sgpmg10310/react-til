import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SidebarExplanationView.module.css';

export default function SidebarExplanationView() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🍔 사이드바 구현 원리 파헤치기</h2>
      <p className={styles.desc}>
        화면 우측 상단의 햄버거 버튼을 누르면 스르륵 나타나는 전체 메뉴 기능은 어떻게 구현되었을까요?<br />
        React의 상태 관리, 이벤트 제어, 그리고 순수 CSS 애니메이션의 조화를 알아봅니다.
      </p>

      <div className={styles.card}>
        <h3>1. 상태 관리 (State)</h3>
        <p>메뉴가 화면에 보이는지(열림), 숨겨져 있는지(닫힘)를 판단하기 위해 <code>useState</code>를 사용합니다.</p>
        <pre className={styles.codeBlock}><code>{`// App.jsx
const [isMenuOpen, setIsMenuOpen] = useState(false);

// 햄버거 버튼 클릭 시 메뉴 열기
<button onClick={() => setIsMenuOpen(true)}> ... </button>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>2. CSS 동적 클래스 바인딩</h3>
        <p>
          React는 상태에 따라 HTML 클래스를 동적으로 조작할 수 있습니다.<br/>
          <code>isMenuOpen</code>이 true일 때만 <code>'open'</code>이라는 CSS 클래스를 배경(overlay)에 붙여줍니다.
        </p>
        <pre className={styles.codeBlock}><code>{`// isMenuOpen이 true면 "side-menu-overlay open", false면 "side-menu-overlay"
<div className={\`side-menu-overlay \${isMenuOpen ? 'open' : ''}\`}>`}</code></pre>
      </div>

      <div className={styles.card}>
        <h3>3. 부드러운 슬라이드 애니메이션 (CSS)</h3>
        <p>
          자바스크립트로 직접 위치를 옮기지 않고, CSS의 <code>transform</code>과 <code>transition</code>을 이용하여 부드러운 애니메이션을 구현합니다. 성능 면에서도 훨씬 유리합니다.
        </p>
        <pre className={styles.codeBlock}><code>{`/* 기본 상태: 오른쪽(X축)으로 100% 밀어내어 화면 밖으로 숨김 */
.side-menu {
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

/* 'open' 클래스가 붙었을 때: X축 이동을 0으로 돌려 화면 안으로 복귀 */
.side-menu-overlay.open .side-menu {
  transform: translateX(0);
}`}</code></pre>
      </div>

      <div className={styles.card} style={{ borderColor: '#ef4444' }}>
        <h3 style={{ color: '#ef4444' }}>4. 🚨 핵심: 이벤트 버블링 방지 (stopPropagation)</h3>
        <p>
          가장 흔히 겪는 버그는 "메뉴 안쪽의 빈 공간을 클릭했는데도 메뉴가 닫혀버리는 현상"입니다.<br/>
          배경(Overlay)을 클릭하면 닫히게 해두었기 때문에, 메뉴 안쪽을 클릭해도 그 클릭 이벤트가 부모(배경)까지 전파(Bubbling)되어 닫힘 함수가 실행되기 때문입니다.
        </p>
        <pre className={styles.codeBlock}><code>{`{/* 1. 배경을 클릭하면 닫힘 함수(closeMenu)가 실행됩니다. */}
<div className="side-menu-overlay" onClick={closeMenu}>

  {/* 2. e.stopPropagation()을 통해 클릭 이벤트가 부모로 올라가는 것을 차단합니다! */}
  <div className="side-menu" onClick={(e) => e.stopPropagation()}>
    메뉴 내용들...
  </div>

</div>`}</code></pre>
        <div style={{ backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
          <strong>💡 이벤트 버블링(Event Bubbling)이란?</strong><br/>
          물속의 거품(Bubble)이 위로 올라가는 것처럼, 특정 요소에서 이벤트가 발생하면 그 이벤트가 부모 요소, 조상 요소로 계속 전달되는 브라우저의 기본 동작입니다. <code>e.stopPropagation()</code>은 이 거품이 위로 올라가는 것을 터뜨려 막아주는 역할을 합니다.
        </div>
      </div>

      <div className={styles.card}>
        <h3>5. 최적화: 클릭 이벤트 무시하기 (pointer-events)</h3>
        <p>메뉴가 닫혀 투명해진 상태(<code>opacity: 0</code>)일지라도, 화면 전체를 덮고 있는 배경 요소가 마우스 클릭을 방해할 수 있습니다. 이를 막기 위해 CSS를 사용합니다.</p>
        <pre className={styles.codeBlock}><code>{`.side-menu-overlay {
  opacity: 0;
  pointer-events: none; /* 투명할 때는 마우스 클릭을 아예 무시(통과)하게 만듭니다. */
}

.side-menu-overlay.open {
  opacity: 1;
  pointer-events: auto; /* 열렸을 때는 다시 클릭을 감지하도록 복구합니다. */
}`}</code></pre>
      </div>

      <button className={styles.backBtn} onClick={() => navigate('/')}>🏠 홈으로 가기</button>
    </div>
  );
}