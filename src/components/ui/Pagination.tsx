import React from 'react';

// 페이지네이션 컴포넌트 props 타입
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLastButtons?: boolean;
  siblingCount?: number;
  className?: string;
}

// 페이지네이션 컴포넌트
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLastButtons = true,
  siblingCount = 1,
  className = '',
}) => {
  // 페이지 배열 생성 (페이지 범위 계산)
  const getPageRange = () => {
    // 시작 페이지와 종료 페이지 계산
    let startPage = Math.max(1, currentPage - siblingCount);
    let endPage = Math.min(totalPages, currentPage + siblingCount);

    // 시작 페이지와 종료 페이지 사이의 페이지 수가 siblingCount*2+1 보다 작으면 보정
    const totalVisiblePages = siblingCount * 2 + 1;
    if (endPage - startPage + 1 < totalVisiblePages) {
      if (currentPage < totalPages / 2) {
        endPage = Math.min(totalPages, startPage + totalVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - totalVisiblePages + 1);
      }
    }

    // 페이지 배열 생성
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // 페이지 버튼 생성
  const renderPageButtons = () => {
    const pageRange = getPageRange();
    
    return pageRange.map((page) => (
      <button
        key={page}
        className={`
          relative h-8 min-w-8 px-3 
          flex items-center justify-center 
          text-sm font-medium 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10
          ${
            page === currentPage
              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:text-primary-300'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
          }
          border
          -ml-px
          first:ml-0 first:rounded-l-md
          last:rounded-r-md
        `}
        onClick={() => onPageChange(page)}
        disabled={page === currentPage}
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </button>
    ));
  };

  // 이전 페이지 버튼
  const renderPreviousButton = () => (
    <button
      className="
        relative h-8 min-w-8 px-2
        flex items-center justify-center
        text-sm font-medium
        border border-gray-300 
        bg-white text-gray-500 hover:bg-gray-50 
        dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700
        rounded-l-md
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage <= 1}
      aria-label="Previous page"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  // 다음 페이지 버튼
  const renderNextButton = () => (
    <button
      className="
        relative h-8 min-w-8 px-2
        flex items-center justify-center
        text-sm font-medium
        border border-gray-300 
        bg-white text-gray-500 hover:bg-gray-50 
        dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700
        rounded-r-md
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage >= totalPages}
      aria-label="Next page"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  // 처음 페이지 버튼
  const renderFirstButton = () => (
    <button
      className="
        relative h-8 min-w-8 px-2
        flex items-center justify-center
        text-sm font-medium
        border border-gray-300 
        bg-white text-gray-500 hover:bg-gray-50 
        dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700
        rounded-l-md
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      onClick={() => onPageChange(1)}
      disabled={currentPage <= 1}
      aria-label="First page"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M8.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L4.414 10l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  // 마지막 페이지 버튼
  const renderLastButton = () => (
    <button
      className="
        relative h-8 min-w-8 px-2
        flex items-center justify-center
        text-sm font-medium
        border border-gray-300 
        bg-white text-gray-500 hover:bg-gray-50 
        dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700
        rounded-r-md
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:z-10
        disabled:opacity-50 disabled:cursor-not-allowed
      "
      onClick={() => onPageChange(totalPages)}
      disabled={currentPage >= totalPages}
      aria-label="Last page"
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
        <path
          fillRule="evenodd"
          d="M11.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L15.586 10l-4.293-4.293a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );

  return (
    <nav className={`flex justify-center items-center mt-8 ${className}`} aria-label="Pagination">
      <div className="flex">
        {showFirstLastButtons && renderFirstButton()}
        {renderPreviousButton()}
        {renderPageButtons()}
        {renderNextButton()}
        {showFirstLastButtons && renderLastButton()}
      </div>
    </nav>
  );
};

export default Pagination;