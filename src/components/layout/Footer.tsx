import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 로고 및 저작권 */}
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-lg font-bold text-primary-600 dark:text-primary-400">
              게시판
            </Link>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} 게시판. All rights reserved.
            </p>
          </div>

          {/* 내비게이션 링크 */}
          <div className="flex flex-wrap gap-6">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              홈
            </Link>
            <Link
              to="/boards"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              게시판
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              이용약관
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;