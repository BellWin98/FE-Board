import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// 기본값으로 컨텍스트 생성
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

// 컨텍스트 프로바이더 컴포넌트
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 로컬 스토리지에서 테마 설정 불러오기 (없으면 시스템 설정 따름)
  const getInitialTheme = (): Theme => {
    // 로컬 스토리지에 저장된 테마 확인
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // 시스템 테마 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // 테마 변경 함수
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // 테마에 따라 document 클래스 업데이트
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // 로컬 스토리지에 테마 설정이 없을 경우에만 시스템 설정 따름
      if (!localStorage.getItem('theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 커스텀 훅 - 테마 컨텍스트 사용을 위한 편의 함수
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;