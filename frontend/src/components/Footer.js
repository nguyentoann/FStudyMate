import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p>&copy; {new Date().getFullYear()} Hệ Thống Kiểm Tra</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-blue-300 transition-colors"><i className="fas fa-envelope"></i></a>
            <a href="#" className="hover:text-blue-300 transition-colors"><i className="fas fa-phone"></i></a>
            <a href="#" className="hover:text-blue-300 transition-colors"><i className="fab fa-facebook"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 