import React, { type InputHTMLAttributes, forwardRef } from 'react';

// 입력 필드 컴포넌트 props 타입
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// 입력 필드 컴포넌트 (forwardRef를 사용하여 ref 전달)
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', ...rest }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 
              bg-white dark:bg-gray-700 
              border border-gray-300 dark:border-gray-600 
              rounded-md shadow-sm 
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''} 
              ${errorClass} 
              ${className}
            `}
            {...rest}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

// 컴포넌트 표시 이름 설정
Input.displayName = 'Input';

export default Input;