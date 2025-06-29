import React, { useState } from "react";
import { Link } from "react-router-dom";

const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-[#f9fbfc] py-4 px-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1366px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-[22px] font-bold leading-[33px] font-poppins"
          >
            <span className="text-[#525fe1]">F</span>
            <span className="text-[#1c1c1c]">StudyMate</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#home"
            className="text-[14px] font-bold leading-[21px] text-white font-poppins"
          >
            Home
          </a>
          <a
            href="#why"
            className="text-[14px] font-normal leading-[21px] text-white font-poppins hover:text-[#1c1c1c]"
          >
            Why Choose Us?
          </a>
          <a
            href="#who"
            className="text-[14px] font-normal leading-[21px] text-white font-poppins hover:text-[#1c1c1c]"
          >
            Who Is It For?
          </a>
          <a
            href="#courses"
            className="text-[14px] font-normal leading-[21px] text-white font-poppins hover:text-[#1c1c1c]"
          >
            Courses
          </a>
          <a
            href="#features"
            className="text-[14px] font-normal leading-[21px] text-white font-poppins hover:text-[#1c1c1c]"
          >
            Features
          </a>
          <a
            href="#preview"
            className="text-[14px] font-normal leading-[21px] text-white font-poppins hover:text-[#1c1c1c]"
          >
            Preview
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/login"
            className="text-[14px] font-bold leading-[21px] text-[#1c1c1c] font-poppins"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-gradient-to-r from-[#525fe1] to-[#4a4eb3] text-white text-[14px] font-bold py-[10px] px-[25px] rounded-full"
          >
            SIGN UP
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white">
          <a href="#home" className="block py-2 text-gray-700">
            Home
          </a>
          <a href="#why" className="block py-2 text-gray-700">
            Why Choose Us?
          </a>
          <a href="#who" className="block py-2 text-gray-700">
            Who Is It For?
          </a>
          <a href="#features" className="block py-2 text-gray-700">
            Features
          </a>
          <a href="#preview" className="block py-2 text-gray-700">
            Preview
          </a>
          <div className="mt-4 flex flex-col space-y-2">
            <Link to="/login" className="text-gray-700 py-2">
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-[#525fe1] text-white px-4 py-2 rounded-full text-center"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
