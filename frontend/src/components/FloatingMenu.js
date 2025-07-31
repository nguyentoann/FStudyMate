import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const FloatingMenu = ({
  forceExpanded = false,
  onClose = null,
  mobileView = false,
}) => {
  const { user, logout } = useAuth();
  const { componentOpacity, blurLevel } = useTheme();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(forceExpanded);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [closingSubmenu, setClosingSubmenu] = useState(null);
  const [animatingOut, setAnimatingOut] = useState(false);

  // Update isExpanded when forceExpanded changes
  useEffect(() => {
    setIsExpanded(forceExpanded);
  }, [forceExpanded]);

  // Handle animation end for collapse animation
  useEffect(() => {
    if (animatingOut) {
      const timer = setTimeout(() => {
        setAnimatingOut(false);
        setClosingSubmenu(null);
      }, 300); // Match animation duration in tailwind config

      return () => clearTimeout(timer);
    }
  }, [animatingOut]);

  // Calculate sidebar opacity based on componentOpacity
  const sidebarOpacity = componentOpacity / 100;
  const backdropBlurValue = `${blurLevel}px`;

  // Handle mouse enter to expand menu
  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsExpanded(true);
  };

  // Handle mouse leave to collapse menu
  const handleMouseLeave = () => {
    setIsHovering(false);
    // Only collapse if no submenu is open
    if (openSubmenu === null) {
      setIsExpanded(false);
    }
  };

  // Get the dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user || !user.role) return "/dashboard";

    switch (user.role) {
      case "student":
        return "/student/dashboard";
      case "lecturer":
        return "/lecturer/dashboard";
      case "admin":
        return "/admin/dashboard";
      case "guest":
        return "/guest/dashboard";
      case "outsrc_student":
        return "/outsource/dashboard";
      default:
        return "/dashboard";
    }
  };

  // Toggle submenu open/closed
  const toggleSubmenu = (menuName) => {
    if (openSubmenu === menuName) {
      setAnimatingOut(true);
      setClosingSubmenu(openSubmenu);
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(menuName);
      setAnimatingOut(false);
    }
  };

  // Toggle expanded/collapsed state manually (for button click)
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Close submenus when menu is collapsed
  useEffect(() => {
    if (!isExpanded) {
      setOpenSubmenu(null);
    }
  }, [isExpanded]);

  // Default profile image if none provided
  const profileImage =
    user?.profileImageUrl || "https://via.placeholder.com/150";

  // Role badge color based on user role
  const getRoleBadgeColor = () => {
    if (!user || !user.role) return "bg-gray-200/80";

    switch (user.role) {
      case "student":
        return "bg-green-400/70 text-green-800";
      case "lecturer":
        return "bg-blue-400/70 text-blue-800";
      case "admin":
        return "bg-purple-400/70 text-purple-800";
      case "guest":
        return "bg-gray-200/70 text-gray-800";
      case "outsrc_student":
        return "bg-yellow-300/70 text-yellow-800";
      default:
        return "bg-gray-200/90 text-gray-800";
    }
  };

  return (
    <div
      className={`${
        mobileView ? "relative" : "fixed left-4 top-1/2 -translate-y-1/2"
      } z-[9002] flex flex-col rounded-xl shadow-xl transition-all duration-300 overflow-hidden sm:flex
                ${isExpanded ? "w-64" : "w-14"}`}
      style={{
        backgroundColor: mobileView
          ? `rgba(255, 255, 255, 1)`
          : `rgba(255, 255, 255, ${sidebarOpacity})`,
        backdropFilter: `blur(${backdropBlurValue})`,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close button for mobile version */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200/50 text-gray-700 hover:bg-gray-300/50 z-[9999]"
          aria-label="Close menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Menu items with fixed width container to prevent content shift */}
      <div
        className={`flex-1 overflow-y-auto py-4 px-1.5 ${
          isExpanded ? "w-64" : "w-14"
        } transition-all duration-300 hide-scrollbar`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maxHeight: mobileView ? "calc(100vh - 80px)" : "auto",
        }}
      >
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {/* Profile section - always rendered but visible based on expansion */}
        <div
          className={`flex flex-col items-center p-2 mb-4 border-b border-gray-200/50 transition-opacity duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden m-0 p-0"
          }`}
        >
          <div className="relative mb-2">
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={profileImage}
              alt="Profile"
            />
            <div
              className={`absolute right-0 top-4/5 transform translate-x-1/2 -translate-y-1/2 px-2 py-0 text-xs font-semibold rounded-md backdrop-blur-sm ${getRoleBadgeColor()}`}
              style={{ backdropFilter: "blur(16px)" }}
            >
              {user?.role}
            </div>
          </div>
          <h2 className="text-sm font-semibold truncate max-w-full">
            {user?.fullName}
          </h2>
          <p className="text-xs text-gray-500 truncate max-w-full">
            {user?.email}
          </p>
        </div>

        <nav className="space-y-2">
          {/* Dashboard */}
          <Link
            to={getDashboardUrl()}
            className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
              ${
                location.pathname.includes("dashboard")
                  ? "bg-indigo-300/50 text-indigo-700"
                  : ""
              }`}
          >
            <svg
              className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {isExpanded && (
              <span className="ml-2 whitespace-nowrap">Dashboard</span>
            )}
          </Link>

          {/* My Classes */}
          <Link
            to={user?.role === "admin" ? "/admin/classes" : "/classes"}
            className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
              ${
                location.pathname.includes("classes")
                  ? "bg-indigo-100/50 text-indigo-700"
                  : ""
              }`}
          >
            <svg
              className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {isExpanded && (
              <span className="ml-2 whitespace-nowrap">My Classes</span>
            )}
          </Link>

          {/* Course Materials */}
          <Link
            to="/my-courses"
            className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
              ${
                location.pathname.includes("my-courses")
                  ? "bg-indigo-100/50 text-indigo-700"
                  : ""
              }`}
          >
            <svg
              className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            {isExpanded && (
              <span className="ml-2 whitespace-nowrap">My Courses</span>
            )}
          </Link>

          {/* Weekly Timetable */}
          <Link
            to="/calendar"
            className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
              ${
                location.pathname.includes("timetable")
                  ? "bg-indigo-100/50 text-indigo-700"
                  : ""
              }`}
          >
            <svg
              className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {isExpanded && (
              <span className="ml-2 whitespace-nowrap">Weekly Timetable</span>
            )}
          </Link>

          {/* Quizzes */}
          <Link
            to="/quiz"
            className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
              ${
                location.pathname.includes("quiz")
                  ? "bg-indigo-100/50 text-indigo-700"
                  : ""
              }`}
          >
            <svg
              className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            {isExpanded && (
              <span className="ml-2 whitespace-nowrap">Quizzes</span>
            )}
          </Link>

          {/* Lessons */}
          <Link
            to="/materials"
            className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
              ${
                location.pathname.includes("lessons")
                  ? "bg-indigo-100/50 text-indigo-700"
                  : ""
              }`}
          >
            <svg
              className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            {isExpanded && (
              <span className="ml-2 whitespace-nowrap">Course Materials</span>
            )}
          </Link>

          {/* Help - simplified version */}
          <div className="relative">
            <button
              onClick={() => toggleSubmenu("help")}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 justify-between"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {isExpanded && (
                  <span className="ml-2 whitespace-nowrap">Help</span>
                )}
              </div>
              {isExpanded && (
                <svg
                  className={`ml-auto h-4 w-4 transition-transform ${
                    openSubmenu === "help" ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {isExpanded &&
              (openSubmenu === "help" ||
                (closingSubmenu === "help" && animatingOut)) && (
                <div
                  className={`pl-7 mt-1 space-y-1 overflow-hidden ${
                    openSubmenu === "help"
                      ? "animate-expand"
                      : "animate-collapse"
                  }`}
                >
                  <Link
                    to="/help/faq"
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500 min-w-[1rem]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">FAQ/Usage</span>
                  </Link>

                  <Link
                    to="/help/feedback"
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500 min-w-[1rem]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">Feedback</span>
                  </Link>

                  <Link
                    to="/help/about"
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500 min-w-[1rem]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">About Us</span>
                  </Link>
                </div>
              )}
          </div>

          {/* Settings - simplified version */}
          <div className="relative">
            <button
              onClick={() => toggleSubmenu("settings")}
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 justify-between"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {isExpanded && (
                  <span className="ml-2 whitespace-nowrap">Settings</span>
                )}
              </div>
              {isExpanded && (
                <svg
                  className={`ml-auto h-4 w-4 transition-transform ${
                    openSubmenu === "settings" ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {isExpanded &&
              (openSubmenu === "settings" ||
                (closingSubmenu === "settings" && animatingOut)) && (
                <div
                  className={`pl-7 mt-1 space-y-1 overflow-hidden ${
                    openSubmenu === "settings"
                      ? "animate-expand"
                      : "animate-collapse"
                  }`}
                >
                  <Link
                    to="/profile"
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500 min-w-[1rem]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span className="whitespace-nowrap">Profile</span>
                  </Link>

                  <Link
                    to="/theme"
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                  >
                    <svg
                      className="w-4 h-4 mr-2 text-gray-500 min-w-[1rem]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                    <span className="whitespace-nowrap">App Theme</span>
                  </Link>
                </div>
              )}
          </div>

          {/* Admin specific menu items */}
          {user?.role === "admin" && (
            <Link
              to="/admin/users"
              className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
                ${
                  location.pathname.includes("admin/users")
                    ? "bg-indigo-100/50 text-indigo-700"
                    : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              {isExpanded && (
                <span className="ml-2 whitespace-nowrap">Manage Users</span>
              )}
            </Link>
          )}

          {/* Lecturer/Admin specific menu items */}
          {/* {(user?.role === "lecturer" || user?.role === "admin") && (
            <Link
              to="/questions"
              className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
                ${
                  location.pathname.includes("questions")
                    ? "bg-indigo-100/50 text-indigo-700"
                    : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {isExpanded && (
                <span className="ml-2 whitespace-nowrap">Manage Questions</span>
              )}
            </Link>
          )} */}

          {/* Room Management Link for Admin */}
          {user?.role === "admin" && (
            <Link
              to="/admin/room-management"
              className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
                ${
                  location.pathname.includes("room-management")
                    ? "bg-indigo-100/50 text-indigo-700"
                    : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {isExpanded && (
                <span className="ml-2 whitespace-nowrap">Room Management</span>
              )}
            </Link>
          )}

          {/* Room Control Link for Admin/Lecturer */}
          {(user?.role === "admin" || user?.role === "lecturer") && (
            <Link
              to="/admin/room-control"
              className={`flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-600/20 w-full
                ${
                  location.pathname.includes("room-control")
                    ? "bg-indigo-100/50 text-indigo-700"
                    : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-500 min-w-[1.25rem]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {isExpanded && (
                <span className="ml-2 whitespace-nowrap">Room Controls</span>
              )}
            </Link>
          )}
        </nav>
      </div>

      {/* Logout button - conditionally visible */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-200/50">
          <button
            onClick={logout}
            className="flex items-center w-full mt-12 px-3 py-2 text-sm text-red-600 hover:bg-red-50/70 rounded-md"
          >
            <svg
              className="w-5 h-5 text-red-500 min-w-[1.25rem]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="ml-2 whitespace-nowrap">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FloatingMenu;
