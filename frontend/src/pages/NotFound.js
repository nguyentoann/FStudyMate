import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`text-center p-8 max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Trang không tồn tại</p>
        <Link 
          to="/" 
          className="inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 