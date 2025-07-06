import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <i className="fas fa-book-open text-2xl mr-3"></i>
          <h1 className="text-2xl font-bold">FStudyMate</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:text-blue-200 transition-colors"><i className="fas fa-home mr-1"></i> Trang chủ</Link></li>
            <li><Link to="/help" className="hover:text-blue-200 transition-colors"><i className="fas fa-question-circle mr-1"></i> Trợ giúp</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 