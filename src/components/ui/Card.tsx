import React from 'react';

// 카드 컴포넌트 props 타입
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subTitle?: string;
  footer?: React.ReactNode;
  hover?: boolean;
  className?: string;
}

// 카드 컴포넌트
const Card: React.FC<CardProps> = ({
  children,
  title,
  subTitle,
  footer,
  hover = true,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg 
        shadow-card
        ${hover ? 'hover:shadow-card-hover transition-shadow duration-300' : ''}
        ${className}
      `}
    >
      {(title || subTitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
          {subTitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subTitle}</p>}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;