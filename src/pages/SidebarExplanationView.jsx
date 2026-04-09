import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SidebarExplanationView.module.css';

export default function SidebarExplanationView() {
  const navigate = useNavigate();

  // 💡 사이드바 직접 테스트를 위한 상태 및 닫기 함수
  const [isTestSidebarOpen, setIsTestSidebarOpen] = useState(false);
  const closeTestSidebar = () => setIsTestSidebarOpen(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeBar = () => setIsSidebarOpen(false);




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

      {/* 새로 추가된 직접 테스트 해보기 섹션 */}
      <div className={styles.card}>
        <h3>6. 🚀 직접 테스트 해보기 (1분 예제)</h3>
        <p>아래 버튼을 눌러 위에서 설명한 원리(상태 관리, 애니메이션, 이벤트 버블링 방지)가 적용된 사이드바를 직접 열어보세요!</p>
        <button 
          onClick={() => setIsTestSidebarOpen(true)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginTop: '10px'
          }}
        >
          테스트용 사이드바 열기
        </button>

        <div style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>💻 예제 전체 소스 코드</h4>
          <pre className={styles.codeBlock}><code>{`import React, { useState } from 'react';

export default function SidebarTest() {
  const [isOpen, setIsOpen] = useState(false);
  const closeSidebar = () => setIsOpen(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>사이드바 열기</button>

      {/* 1. 배경 오버레이 (클릭 시 닫힘) */}
      <div 
        onClick={closeSidebar}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.4)',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease', zIndex: 9999
        }}
      >
        {/* 2. 실제 사이드바 (이벤트 버블링 차단) */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', top: 0, right: 0, width: '300px', height: '100vh',
            backgroundColor: '#ffffff',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease', padding: '20px'
          }}
        >
          <h3>테스트 메뉴</h3>
          <button onClick={closeSidebar}>닫기</button>
        </div>
      </div>
    </div>
  );
}`}</code></pre>
        </div>

        {/* 테스트용 오버레이 배경 */}
        <div 
          onClick={closeTestSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: isTestSidebarOpen ? 1 : 0,
            pointerEvents: isTestSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease',
            zIndex: 9999
          }}
        >
          {/* 테스트용 사이드바 (이벤트 버블링 방지 적용) */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '300px',
              height: '100vh',
              backgroundColor: '#ffffff',
              boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
              transform: isTestSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              color: '#0f172a'
            }}
          >
            {/* 사이드바 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>테스트 메뉴</h3>
              <button 
                onClick={closeTestSidebar}
                style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' }}
              >
                &times;
              </button>
            </div>
            
            {/* 메뉴 리스트 */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>🏠 홈으로</li>
              <li style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>⚙️ 설정</li>
              <li style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>📞 고객센터</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        
      </div>
      <button onClick={() => setIsSidebarOpen(true)}>열기</button>

      <div 
        onClick={closeBar} /* 배경(오버레이)을 클릭하면 닫히도록 설정합니다. */
        style={{
          /* 화면 스크롤과 무관하게 전체 화면을 가득 채우도록 고정시킵니다. */
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          /* 검은색 바탕에 50%의 투명도를 줍니다. */
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: isSidebarOpen ? 1 : 0, pointerEvents: isSidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease', zIndex: 9999,
          /* 상태에 따라 완전 보임(1) 혹은 완전 투명(0)으로 전환합니다. */
          opacity: isSidebarOpen ? 1 : 0, 
          /* 투명할 때는 마우스 클릭을 무시(none)하여 뒤의 요소들이 눌리게 하고, 오버레이가 열려 있을 때는 클릭을 감지(auto)하게 합니다. */
          pointerEvents: isSidebarOpen ? 'auto' : 'none',
          /* 0.3초 동안 부드럽게 스르륵 나타나거나 사라지게 애니메이션을 추가합니다. */
          transition: 'opacity 0.3s ease', 
          /* 페이지의 다른 어떤 요소들보다 맨 위에 덮이도록 순서를 가장 높게 설정합니다. */
          zIndex: 9999
        }}
      >
        {/* 실제 메뉴 내용이 들어가는 흰 바탕의 컨테이너입니다. */}
        <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#fff', width: '300px', height: '100%', padding: '20px', position: 'absolute', right: 0 }}>
          
          {/* 1. 사이드바 헤더 영역: 제목과 닫기 버튼을 가로 양 끝(space-between)으로 배치하고 수직 중앙 정렬(align-items)합니다. */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
            {/* h3 태그의 기본 여백(margin)을 없애 텍스트 높낮이 배치를 깔끔하게 만듭니다. */}
            <h3 style={{ margin: 50 }}>테스트 메뉴</h3>
            
            {/* 닫기 버튼: 기존 버튼의 배경과 테두리를 없애고 글자 크기를 키워 일반 텍스트 아이콘처럼 보이게 조작합니다. */}
            <button 
              onClick={closeBar} /* (수정됨) 알맞은 상태 닫기 함수로 변경했습니다. */
              style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' }}
            >
              &times; {/* HTML 특수문자로 닫기 기호(X)를 렌더링합니다. */}
            </button>
          </div>
          
          {/* 2. 메뉴 리스트 영역: 기본 ul 태그의 불릿(점)과 여백을 지우고, flex를 사용해 항목들을 세로 방향(column)으로 나열합니다. */}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' /* 각 메뉴 사이에 15px의 간격을 줍니다. */ }}>
            {/* 개별 메뉴 항목: 여백(padding), 배경색, 둥근 테두리(border-radius)를 주어 클릭하기 좋은 버튼/박스 형태로 스타일링합니다. */}
            <li style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>🏠 홈으로</li>
            <li style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>⚙️ 설정</li>
            <li style={{ padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>📞 고객센터</li>
          </ul>
        </div>
      </div>
      
      <button onClick={closeBar}>닫기</button>
      
      <button className={styles.backBtn} onClick={() => navigate('/')}>🏠 홈으로 가기</button>
    </div>
  );
}