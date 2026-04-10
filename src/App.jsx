import { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HomeView from './pages/HomeView';
import AboutView from './pages/AboutView';
import ComponentTestView from './pages/ComponentTestView';
import HooksTestView from './pages/HooksTestView';
import ContextTestView from './pages/ContextTestView';
import AdvancedHooksView from './pages/AdvancedHooksView';
import AdditionalHooksView from './pages/AdditionalHooksView';
import BasicSyntaxView from './pages/BasicSyntaxView';
import CallbackTestView from './pages/CallbackTestView';
import VueSyntaxView from './pages/VueSyntaxView';
import TypeScriptView from './pages/TypeScriptView';
import NextJsView from './pages/NextJsView';
import NuxtJsView from './pages/NuxtJsView';
import SpringView from './pages/SpringView';
import ZustandReactQueryLabView from './pages/ZustandReactQueryLabView';
import GolfMk6ThermostatView from './pages/GolfMk6ThermostatView';
import HookGuideView from './pages/HookGuideView';
import FrontendMethodologyView from './pages/FrontendMethodologyView';
import BasicFrontendSkillsView from './pages/BasicFrontendSkillsView';
import GitAdvancedPlaybookView from './pages/GitAdvancedPlaybookView';
import SpringAiMcpToolsView from './pages/SpringAiMcpToolsView';
import FirebaseFrontendBootView from './pages/FirebaseFrontendBootView';
import InfiniteScrollRefreshLabView from './pages/InfiniteScrollRefreshLabView';
import SidebarExplanationView from './pages/SidebarExplanationView';
import Test from './components/Test.jsx';
// 한글 게임 컴포넌트 임포트
import HangulGameView from './pages/HangulGameView.jsx';
import CombineSoundsGame from './pages/game1/CombineSoundsGame.jsx';
import WordFromConsonantGame from './pages/game2/WordFromConsonantGame.jsx';
import PictureMatchGame from './pages/game3/PictureMatchGame.jsx';
import LetterToImageGame from './pages/game4/LetterToImageGame.jsx';
import WhiteboardGame from './pages/game5/WhiteboardGame.jsx';
import PoopDodgeGame from './pages/game6/PoopDodgeGame.jsx';

import './App.css';

// 전체 메뉴 계층 구조 데이터 (대분류 > 중분류 > 소분류)
const menuData = [
  {
    large: '프론트엔드 개발',
    categories: [
      {
        medium: 'React',
        items: [
          { name: 'React 기본 문법', path: '/basic-syntax' },
          { name: '컴포넌트 통신', path: '/component-test' },
          { name: 'React Hooks 마스터', path: '/hooks-test' },
          { name: 'Context API', path: '/context-api-test' },
          { name: '심화 Hooks', path: '/advanced-hooks-test' },
          { name: '추가 Hooks', path: '/additional-hooks-test' },
          { name: '초간단 useCallback', path: '/callback-test' },
          { name: 'React 기본 Hook 가이드', path: '/hook-guide' },
          { name: 'Zustand + React Query 실습', path: '/zustand-react-query-lab' },
          { name: '무한 스크롤 + 새로고침 실습', path: '/infinite-scroll-refresh-lab' },
        ]
      },
      {
        medium: 'UI 컴포넌트 구현',
        items: [
          { name: '사이드바(메뉴) 구현 원리', path: '/sidebar-explanation' }
        ]
      },
      {
        medium: 'Vue',
        items: [
          { name: 'Vue 기본 문법', path: '/vue-syntax' }
        ]
      },
      {
        medium: '프레임워크 & 언어',
        items: [
          { name: 'TypeScript', path: '/typescript' },
          { name: 'Next.js', path: '/nextjs' },
          { name: 'Nuxt.js', path: '/nuxtjs' }
        ]
      },
      {
        medium: '실무 스킬 & 방법론',
        items: [
          { name: '프론트엔드 기본 스킬', path: '/frontend-basic-skills' },
          { name: '프론트엔드 방법론', path: '/frontend-methodology' },
          { name: 'Git 실무 플레이북', path: '/git-advanced-playbook' },
          { name: 'Firebase 프론트 구축', path: '/firebase-frontend-boot' }
        ]
      }
    ]
  },
  {
    large: '백엔드 개발',
    categories: [
      {
        medium: 'Spring 생태계',
        items: [
          { name: 'Spring 기본', path: '/spring' },
          { name: 'Spring AI + MCP', path: '/spring-ai-mcp-tools' }
        ]
      }
    ]
  },
  {
    large: '일상 및 취미',
    categories: [
      {
        medium: '자동차 정비',
        items: [
          { name: '폭스바겐 골프 MK6 써모스탯', path: '/golf-mk6-thermostat' }
        ]
      }
    ]
  },
  {
    large: '놀이',
    categories: [
      {
        medium: '한글 게임',
        items: [
          { name: '🎮 한글 게임 메인', path: '/hangul-game' },
          { name: '1. 자음+모음 합치기', path: '/hangul-game/game1' },
          { name: '2. 단어 만들기', path: '/hangul-game/game2' },
          { name: '3. 그림 카드 맞추기', path: '/hangul-game/game3' },
          { name: '4. 글자 던지기', path: '/hangul-game/game4' },
          { name: '5. 마법의 화이트보드 🪄', path: '/hangul-game/game5' },
          { name: '6. 한글 똥 피하기 💩', path: '/hangul-game/game6' }
        ]
      }
    ]
  },
  {
    large: '테스트',
    categories: [
      {
        medium: '실험실',
        items: [
          { name: '렌더링 테스트', path: '/test' }
        ]
      }
    ]
  }
];

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 💡 [사이드바 상태] 메뉴가 열려있는지(true) 닫혀있는지(false) 기억하는 상태입니다.
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // 메뉴를 닫는 동작을 별도의 함수로 분리하여 여러 곳에서 재사용합니다.
  const closeMenu = () => setIsMenuOpen(false);

  // 💡 [메뉴 이동 함수] 메뉴 항목을 클릭하면 1) 해당 주소로 이동하고 2) 메뉴 창을 닫아줍니다.
  const handleMenuClick = (path) => {
    navigate(path);
    closeMenu();
  };

  return (
    <div className="app-layout">
      <header className="header">
        <h1 onClick={() => navigate('/')} className="logo">☁️ 발등에 불코딩 🧸</h1>
        <p>귀엽게 알아보는 프론트엔드 지식!</p>

        <nav className="main-nav">
          <Link to="/" className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}>🏠 홈</Link>
          <Link to="/about" className={`nav-btn ${location.pathname.startsWith('/about') ? 'active' : ''}`}>📚 문법 학습 허브</Link>
        </nav>

        {/* 💡 [햄버거 버튼] 클릭 시 isMenuOpen 상태를 true로 변경하여 메뉴를 엽니다. */}
        <button className="hamburger-btn" onClick={() => setIsMenuOpen(true)}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </header>

      {/* 현재 URL에 맞는 화면(HomeView 또는 DetailView 등)이 이곳에 렌더링 됩니다. (Vue의 RouterView와 동일) */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/component-test" element={<ComponentTestView />} />
          <Route path="/hooks-test" element={<HooksTestView />} />
          <Route path="/context-api-test" element={<ContextTestView />} />
          <Route path="/advanced-hooks-test" element={<AdvancedHooksView />} />
          <Route path="/additional-hooks-test" element={<AdditionalHooksView />} />
          <Route path="/basic-syntax" element={<BasicSyntaxView />} />
          <Route path="/callback-test" element={<CallbackTestView />} />
          <Route path="/vue-syntax" element={<VueSyntaxView />} />
          <Route path="/zustand-react-query-lab" element={<ZustandReactQueryLabView />} />
          <Route path="/hook-guide" element={<HookGuideView />} />
          <Route path="/frontend-methodology" element={<FrontendMethodologyView />} />
          <Route path="/frontend-basic-skills" element={<BasicFrontendSkillsView />} />
          <Route path="/git-advanced-playbook" element={<GitAdvancedPlaybookView />} />
          <Route path="/spring-ai-mcp-tools" element={<SpringAiMcpToolsView />} />
          <Route path="/firebase-frontend-boot" element={<FirebaseFrontendBootView />} />
          <Route path="/infinite-scroll-refresh-lab" element={<InfiniteScrollRefreshLabView />} />
          <Route path="/typescript" element={<TypeScriptView />} />
          <Route path="/nextjs" element={<NextJsView />} />
          <Route path="/nuxtjs" element={<NuxtJsView />} />
          <Route path="/spring" element={<SpringView />} />
          <Route path="/golf-mk6-thermostat" element={<GolfMk6ThermostatView />} />
          <Route path="/sidebar-explanation" element={<SidebarExplanationView />} />
          {/* 한글 게임 라우트 추가 */}
          <Route path="/hangul-game" element={<HangulGameView />} />
          <Route path="/hangul-game/game1" element={<CombineSoundsGame />} />
          <Route path="/hangul-game/game2" element={<WordFromConsonantGame />} />
          <Route path="/hangul-game/game3" element={<PictureMatchGame />} />
          <Route path="/hangul-game/game4" element={<LetterToImageGame />} />
          <Route path="/hangul-game/game5" element={<WhiteboardGame />} />
          <Route path="/hangul-game/game6" element={<PoopDodgeGame />} />
          {/* 추가될 라우트(DetailView, ApiTestView 등)는 이 아래에 작성 */}
          <Route path="/test" element={<Test />} />
        </Routes>
      </main>

      {/* 하단 저작권 표시 (Footer) */}
      <footer style={{ textAlign: 'center', padding: '25px 20px', color: '#64748b', fontSize: '0.9rem', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
        &copy; {new Date().getFullYear()} 발등에 불코딩(mg_parker). All rights reserved.
      </footer>

      {/* Portal(Vue의 Teleport)을 위한 타겟 엘리먼트 */}
      <div id="modal-container"></div>

      {/* 💡 [오버레이 배경] 메뉴 뒤에 깔리는 반투명 검은 배경입니다.
          isMenuOpen 상태가 true일 때만 'open' 클래스가 추가되어 화면에 나타납니다.
          배경(빈 공간)을 클릭하면 closeMenu가 실행되어 메뉴가 닫힙니다. */}
      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={closeMenu}>
        
        {/* 💡 [실제 사이드바 영역] 
            onClick={(e) => e.stopPropagation()}: 이 부분이 핵심입니다!
            메뉴 안쪽 흰색 바탕을 클릭했을 때, 클릭 이벤트가 부모(오버레이)로 전달되어 메뉴가 닫혀버리는 현상(이벤트 버블링)을 막아줍니다. */}
        <div className="side-menu" onClick={(e) => e.stopPropagation()}>
          <div className="side-menu-header">
            <h2>전체 메뉴</h2>
            <button className="close-btn" onClick={closeMenu}>&times;</button>
          </div>
          <div className="side-menu-content">
            {menuData.map((largeCategory, i) => (
              <div key={i} className="menu-large">
                <div className="menu-large-title">{largeCategory.large}</div>
                {largeCategory.categories.map((mediumCategory, j) => (
                  <div key={j} className="menu-medium">
                    <div className="menu-medium-title">📂 {mediumCategory.medium}</div>
                    <ul className="menu-small-list">
                      {mediumCategory.items.map((item, k) => (
                        <li key={k}>
                          <button className="menu-link-btn" onClick={() => handleMenuClick(item.path)}>
                            📄 {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}