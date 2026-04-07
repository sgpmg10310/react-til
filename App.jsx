import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HomeView from './HomeView';
import AboutView from './AboutView';
import ComponentTestView from './ComponentTestView';
import HooksTestView from './HooksTestView';
import ContextTestView from './ContextTestView';
import AdvancedHooksView from './AdvancedHooksView';
import AdditionalHooksView from './AdditionalHooksView';
import BasicSyntaxView from './BasicSyntaxView';
import CallbackTestView from './CallbackTestView';
import Test from './Test.jsx';

import './App.css';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <header className="header">
        <h1 onClick={() => navigate('/')} className="logo">☁️ 박명근의 지식 노트 🧸</h1>
        <p>귀엽게 알아보는 프론트엔드 지식!</p>

        <nav className="main-nav">
          <Link to="/" className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}>🏠 홈</Link>
          <Link to="/about" className={`nav-btn ${location.pathname.startsWith('/about') ? 'active' : ''}`}>📚 문법 학습 허브</Link>
        </nav>
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
          {/* 추가될 라우트(DetailView, ApiTestView 등)는 이 아래에 작성 */}
          <Route path="/test" element={<Test />} />
        </Routes>
      </main>

      {/* Portal(Vue의 Teleport)을 위한 타겟 엘리먼트 */}
      <div id="modal-container"></div>
    </div>
  );
}