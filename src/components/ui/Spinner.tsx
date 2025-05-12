import React from 'react';

// 스피너 컴포넌트 props 타입
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'gray' | 'white';
  className?: string;
  fullScreen?: boolean;
}

// 스피너 컴포넌트
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  fullScreen = false,
}) => {
  // 크기에 따른 클래스
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  // 색상에 따른 클래스
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    gray: 'text-gray-500',
    white: 'text-white',
  };

  // 스피너 SVG
  const spinner = (
    <svg
      className={`
        animate-spin 
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      data-testid="spinner"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // 전체 화면 로딩 스피너
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;