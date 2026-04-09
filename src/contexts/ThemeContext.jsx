import { createContext, useState, useContext } from 'react';

// 1. Context 생성: 기본값으로 'light'를 설정합니다.
// 이 컨텍스트는 앱의 어느 곳에서나 테마 정보(theme)와 테마를 변경하는 함수(toggleTheme)를 제공합니다.
const ThemeContext = createContext();

// 2. Provider 컴포넌트 생성:
// 이 컴포넌트는 자식 컴포넌트들에게 컨텍스트 값을 제공하는 역할을 합니다.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Custom Hook 생성:
// 매번 useContext(ThemeContext)를 쓰는 대신, 이 Hook을 사용하여 더 간편하게 컨텍스트를 사용할 수 있습니다.
export const useTheme = () => useContext(ThemeContext);