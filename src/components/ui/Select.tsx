import React, { type SelectHTMLAttributes, forwardRef } from 'react';

// 셀렉트 옵션 타입
export interface SelectOption {
  value: string | number;
  label: string;
}

// 셀렉트 컴포넌트 props 타입
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

// 셀렉트 컴포넌트 (forwardRef를 사용하여 ref 전달)
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, fullWidth = true, className = '', onChange, ...rest }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

    // 변경 이벤트 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={`mb-4 ${widthClass}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
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
          onChange={handleChange}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

// 컴포넌트 표시 이름 설정
Select.displayName = 'Select';

export default Select;