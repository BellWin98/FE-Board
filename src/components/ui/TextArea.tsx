import { type TextareaHTMLAttributes, forwardRef } from 'react';

// 텍스트 영역 컴포넌트 props 타입
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  rows?: number;
}

// 텍스트 영역 컴포넌트 (forwardRef를 사용하여 ref 전달)
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, fullWidth = true, className = '', rows = 4, ...rest }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full px-3 py-2 
            bg-white dark:bg-gray-700 
            border border-gray-300 dark:border-gray-600 
            rounded-md shadow-sm 
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errorClass} 
            ${className}
          `}
          {...rest}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

// 컴포넌트 표시 이름 설정
TextArea.displayName = 'TextArea';

export default TextArea;