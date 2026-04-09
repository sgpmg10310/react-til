import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

const queryClient = new QueryClient();

// index.html 파일에서 id가 'root'인 엘리먼트를 찾습니다.
const rootElement = document.getElementById('root');

// 찾은 엘리먼트에 React 앱을 렌더링합니다.
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* GitHub Pages 환경에서 새로고침 시 404 에러를 방지하기 위해 HashRouter를 사용합니다. */}
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <App />
        </HashRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);