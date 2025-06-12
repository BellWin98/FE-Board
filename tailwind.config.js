/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 핑크 계열 Primary 색상
        primary: {
          50: '#fdf2f8',   // 가장 연한 핑크
          100: '#fce7f3',  // 연한 핑크
          200: '#fbcfe8',  // 밝은 핑크
          300: '#f9a8d4',  // 중간 밝은 핑크
          400: '#f472b6',  // 중간 핑크
          500: '#ec4899',  // 기본 핑크 (브랜드 컬러)
          600: '#db2777',  // 진한 핑크
          700: '#be185d',  // 더 진한 핑크
          800: '#9d174d',  // 매우 진한 핑크
          900: '#831843',  // 가장 진한 핑크
        },
        // 보조 색상 (핑크와 조화로운 색상)
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // 핑크 기반 배경 색상 시스템
        background: {
          primary: '#fef7f0',      // 메인 배경 (아주 연한 핑크-크림)
          secondary: '#fdf2f8',    // 카드 배경 (연한 핑크)
          tertiary: '#fce7f3',     // 강조 영역 배경
        },
        // 다크 모드용 핑크 색상
        'dark-pink': {
          50: '#2d1b20',
          100: '#3d2329',
          200: '#4d2a32',
          300: '#5d323b',
          400: '#6d3944',
          500: '#7d414d',
          600: '#8d4856',
          700: '#9d505f',
          800: '#ad5768',
          900: '#bd5f71',
        }
      },
      // 그라데이션 정의
      backgroundImage: {
        'pink-gradient': 'linear-gradient(135deg, #fef7f0 0%, #fdf2f8 50%, #fce7f3 100%)',
        'pink-gradient-dark': 'linear-gradient(135deg, #2d1b20 0%, #3d2329 50%, #4d2a32 100%)',
        'hero-pink': 'radial-gradient(ellipse at center, #fce7f3 0%, #fef7f0 100%)',
      },
      // 박스 섀도우
      boxShadow: {
        'pink-sm': '0 1px 2px 0 rgba(236, 72, 153, 0.05)',
        'pink': '0 1px 3px 0 rgba(236, 72, 153, 0.1), 0 1px 2px 0 rgba(236, 72, 153, 0.06)',
        'pink-md': '0 4px 6px -1px rgba(236, 72, 153, 0.1), 0 2px 4px -1px rgba(236, 72, 153, 0.06)',
        'pink-lg': '0 10px 15px -3px rgba(236, 72, 153, 0.1), 0 4px 6px -2px rgba(236, 72, 153, 0.05)',
        'pink-xl': '0 20px 25px -5px rgba(236, 72, 153, 0.1), 0 10px 10px -5px rgba(236, 72, 153, 0.04)',
      },
      // 애니메이션
      animation: {
        'pink-pulse': 'pink-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pink-bounce': 'pink-bounce 1s infinite',
      },
      keyframes: {
        'pink-pulse': {
          '0%, 100%': {
            opacity: '1',
            backgroundColor: '#fce7f3',
          },
          '50%': {
            opacity: '.8',
            backgroundColor: '#f9a8d4',
          },
        },
        'pink-bounce': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            backgroundColor: '#ec4899',
          },
          '50%': {
            transform: 'none',
            backgroundColor: '#f472b6',
          },
        },
      },
    },
  },
  plugins: [
    // 커스텀 유틸리티 클래스 추가
    function({ addUtilities }) {
      const newUtilities = {
        '.bg-pink-theme': {
          background: 'linear-gradient(135deg, #fef7f0 0%, #fdf2f8 50%, #fce7f3 100%)',
        },
        '.bg-pink-theme-dark': {
          background: 'linear-gradient(135deg, #2d1b20 0%, #3d2329 50%, #4d2a32 100%)',
        },
        '.text-pink-gradient': {
          background: 'linear-gradient(135deg, #ec4899, #f472b6)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}