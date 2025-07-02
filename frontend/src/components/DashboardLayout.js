import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useGroupChat } from "../context/GroupChatContext";
import { useTheme } from "../context/ThemeContext";
import Chat from "./Chat";
import AIChat from "./AIChat";
import GroupChat from "./GroupChat";
import Navbar from "./Navbar";
import GlareHover from "./GlareHover";
import ClickSpark from "./ClickSpark";
import FloatingMenu from "./FloatingMenu";
import JokeNotification from "./JokeNotification";
import WebRTCDebugger from "./WebRTCDebugger";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { unreadCount, fetchConversations } = useChat();
  const { groups } = useGroupChat();
  const {
    backgroundImage,
    backgroundOpacity,
    componentOpacity,
    blurLevel,
    menuType,
  } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [showMobileFloatingMenu, setShowMobileFloatingMenu] = useState(false);

  // Calculate sidebar opacity based on componentOpacity
  const sidebarOpacity = componentOpacity / 100;
  const backdropBlurValue = `${blurLevel}px`;

  // Mark content as loaded after a short delay to ensure all components have rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle sidebar toggle - different behavior based on screen size
  const handleSidebarToggle = () => {
    // For desktop with traditional sidebar
    if (menuType !== "floating") {
      setIsMenuOpen(!isMenuOpen);
    }
    // For mobile with floating menu
    else {
      setShowMobileFloatingMenu(!showMobileFloatingMenu);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  // Default profile image if none provided
  const profileImage =
    user?.profileImageUrl || "https://via.placeholder.com/150";

  // Handle opening AI chat
  const handleOpenAIChat = () => {
    // Close other chats if open
    setIsChatOpen(false);
    setIsGroupChatOpen(false);
    setIsAIChatOpen(!isAIChatOpen);
  };

  // Handle opening regular chat
  const handleOpenChat = () => {
    // Close other chats if open
    setIsAIChatOpen(false);
    setIsGroupChatOpen(false);

    // If opening the chat, refresh conversations
    if (!isChatOpen) {
      // Force refresh conversations
      fetchConversations();
    }

    setIsChatOpen(!isChatOpen);
  };

  // Handle opening group chat
  const handleOpenGroupChat = () => {
    // Close other chats if open
    setIsAIChatOpen(false);
    setIsChatOpen(false);
    setIsGroupChatOpen(!isGroupChatOpen);
  };

  // Toggle submenu open/closed
  const toggleSubmenu = (menuName) => {
    if (openSubmenu === menuName) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(menuName);
    }
  };

  // Check if user role is student or admin (roles that can use group chat)
  const canUseGroupChat = user?.role === "student" || user?.role === "admin";

  // Menu items with submenu support
  const renderMenuItems = (isMobile = false) => {
    // Background with slight transparency for better visibility
    const menuItemBg = `rgba(255, 255, 255, 0.1)`;

    const menuItemStyle = {
      width: "100%",
      padding: "0",
      margin: "4px 0",
    };

    const glareProps = {
      glareColor: "#ffffff",
      glareOpacity: 0.3,
      glareAngle: -30,
      glareSize: 300,
      transitionDuration: 800,
      background: menuItemBg,
      borderRadius: "6px",
      height: "auto",
    };

    return (
      <>
        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to={getDashboardUrl()}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
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
            Dashboard
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link to={user?.role === 'admin' ? "/admin/classes" : "/classes"} className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            My Classes
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to="/calendar"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
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
            Weekly Timetable
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to="/calendar"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
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
            Calendar & Events
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to="/quiz"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
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
            Quizzes
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to="/lessons"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
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
            Lessons
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to="/materials"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
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
            Course Materials
          </Link>
        </GlareHover>

        <GlareHover {...glareProps} style={menuItemStyle}>
          <Link
            to="/student-overview"
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
          >
            <svg
              className="w-5 h-5 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Student Overview
          </Link>
        </GlareHover>

        {/* Requests Submenu */}
        <div className="relative">
          <GlareHover {...glareProps} style={menuItemStyle}>
            <button
              onClick={() => toggleSubmenu("requests")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Request
              </div>
              <svg
                className={`h-4 w-4 transition-transform ${
                  openSubmenu === "requests" ? "transform rotate-180" : ""
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
            </button>
          </GlareHover>
          {openSubmenu === "requests" && (
            <div className="pl-7 mt-1 space-y-1">
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/request/move-class"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  To Move Class
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/request/join-class"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Join in New Class
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/request/regrade"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  Regrade Exam
                </Link>
              </GlareHover>
            </div>
          )}
        </div>

        {/* Help Submenu */}
        <div className="relative">
          <GlareHover {...glareProps} style={menuItemStyle}>
            <button
              onClick={() => toggleSubmenu("help")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
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
                Help
              </div>
              <svg
                className={`h-4 w-4 transition-transform ${
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
            </button>
          </GlareHover>
          {openSubmenu === "help" && (
            <div className="pl-7 mt-1 space-y-1">
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/help/faq"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  FAQ/Usage
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/help/feedback"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  Feedback
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/help/about"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  About Us
                </Link>
              </GlareHover>
            </div>
          )}
        </div>

        {/* Settings Submenu */}
        <div className="relative">
          <GlareHover {...glareProps} style={menuItemStyle}>
            <button
              onClick={() => toggleSubmenu("settings")}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
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
                Settings
              </div>
              <svg
                className={`h-4 w-4 transition-transform ${
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
            </button>
          </GlareHover>
          {openSubmenu === "settings" && (
            <div className="pl-7 mt-1 space-y-1">
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/profile"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  Profile
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/account"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  Account
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/language"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                    />
                  </svg>
                  Language
                </Link>
              </GlareHover>
              <GlareHover {...glareProps} style={menuItemStyle}>
                <Link
                  to="/theme"
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
                >
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
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
                  App Theme
                </Link>
              </GlareHover>
            </div>
          )}
        </div>

        {/* Admin specific menu items */}
        {user?.role === "admin" && (
          <GlareHover {...glareProps} style={menuItemStyle}>
            <Link
              to="/admin/users"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
            >
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
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
              Manage Users
            </Link>
          </GlareHover>
        )}

        {/* Lecturer specific menu items */}
        {(user?.role === "lecturer" || user?.role === "admin") && (
          <GlareHover {...glareProps} style={menuItemStyle}>
            <Link
              to="/questions"
              className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100/20 rounded-md"
            >
              <svg
                className="w-5 h-5 mr-2 text-gray-500"
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
              Manage Questions
            </Link>
          </GlareHover>
        )}
      </>
    );
  };

  return (
    <ClickSpark
      sparkColor="#fff"
      sparkSize={30}
      sparkRadius={20}
      sparkCount={10}
      duration={500}
    >
      <div className="flex h-screen overflow-hidden bg-gray-100 relative">
        {/* Custom Background Layer - This will be applied after content is loaded */}
        {backgroundImage && contentLoaded && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: backgroundOpacity / 100,
              zIndex: -1,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />
        )}

        {/* Navbar - visible on all screens */}
        <Navbar toggleSidebar={handleSidebarToggle} />

        {/* Conditional rendering based on menu type */}
        {menuType === "floating" ? (
          /* Floating Menu - hidden on mobile but controlled by showMobileFloatingMenu */
          <>
            {/* Desktop version - always visible on sm and up */}
            <div className="hidden sm:block">
              <FloatingMenu />
            </div>

            {/* Mobile version - conditionally visible with animation */}
            {showMobileFloatingMenu && (
              <div className="sm:hidden animate-slide-in fixed inset-0 z-[9000]">
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-[9001]"
                  onClick={() => setShowMobileFloatingMenu(false)}
                ></div>
                <div className="relative z-[9002] max-h-screen overflow-auto pt-16 pb-4 px-4">
                  <FloatingMenu
                    forceExpanded={true}
                    onClose={() => setShowMobileFloatingMenu(false)}
                    mobileView={true}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Traditional Sidebar - Always visible on desktop */
          <>
            <div className="hidden lg:flex lg:flex-shrink-0 pt-14">
              <div
                className="flex flex-col w-64 shadow-md"
                style={{
                  backgroundColor: `rgba(255, 255, 255, ${sidebarOpacity})`,
                  backdropFilter: `blur(${backdropBlurValue})`,
                }}
              >
                <div className="flex flex-col flex-1 h-0 overflow-y-auto">
                  <div className="flex flex-col items-center p-4 border-b border-gray-200/50">
                    <img
                      className="h-20 w-20 rounded-full object-cover mb-2"
                      src={profileImage}
                      alt="Profile"
                    />
                    <h2 className="text-lg font-semibold">{user?.fullName}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      Role: {user?.role}
                    </p>
                  </div>

                  <nav className="flex-1 px-2 py-4 bg-transparent">
                    <div className="mt-2 space-y-1">{renderMenuItems()}</div>
                  </nav>

                  <div className="p-3 border-t border-gray-200/50">
                    <GlareHover
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                      glareAngle={-30}
                      glareSize={300}
                      transitionDuration={800}
                      background="rgba(255, 255, 255, 0.1)"
                      borderRadius="6px"
                      height="auto"
                      style={{ width: "100%", padding: "0", margin: "4px 0" }}
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50/70 rounded-md"
                      >
                        <svg
                          className="w-5 h-5 mr-2 text-red-500"
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
                        Logout
                      </button>
                    </GlareHover>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile sidebar */}
            {isMenuOpen && (
              <div className="fixed inset-0 z-[100] flex lg:hidden">
                {/* Overlay */}
                <div
                  className="fixed inset-0 bg-gray-600 bg-opacity-75"
                  onClick={() => setIsMenuOpen(false)}
                ></div>

                {/* Sidebar */}
                <div
                  className="relative flex-1 flex flex-col max-w-xs w-full mt-14 z-[101]"
                  style={{
                    backgroundColor: `rgba(255, 255, 255, ${sidebarOpacity})`,
                    backdropFilter: `blur(${backdropBlurValue})`,
                  }}
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2 z-[102]">
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 h-0 overflow-y-auto">
                    <div className="flex flex-col items-center p-4 border-b border-gray-200/50">
                      <img
                        className="h-20 w-20 rounded-full object-cover mb-2"
                        src={profileImage}
                        alt="Profile"
                      />
                      <h2 className="text-lg font-semibold">
                        {user?.fullName}
                      </h2>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        Role: {user?.role}
                      </p>
                    </div>

                    <nav className="flex-1 px-2 py-4 bg-transparent">
                      <div className="mt-2 space-y-1">
                        {renderMenuItems(true)}
                      </div>
                    </nav>

                    <div className="p-3 border-t border-gray-200/50">
                      <GlareHover
                        glareColor="#ffffff"
                        glareOpacity={0.3}
                        glareAngle={-30}
                        glareSize={300}
                        transitionDuration={800}
                        background="rgba(255, 255, 255, 0.1)"
                        borderRadius="6px"
                        height="auto"
                        style={{ width: "100%", padding: "0", margin: "4px 0" }}
                      >
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50/70 rounded-md"
                        >
                          <svg
                            className="w-5 h-5 mr-2 text-red-500"
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
                          Logout
                        </button>
                      </GlareHover>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Mobile header - only show if not in the dashboard page */}
          {!location.pathname.includes("dashboard") && (
            <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow-md lg:hidden mt-14">
              <div className="flex-1 flex items-center justify-center px-4">
                <h1 className="text-lg font-medium text-gray-700">
                  {user?.role === "admin"
                    ? "Admin Dashboard"
                    : user?.role === "lecturer"
                    ? "Lecturer Dashboard"
                    : user?.role === "student"
                    ? "Student Dashboard"
                    : user?.role === "outsrc_student"
                    ? "Outsource Student Dashboard"
                    : user?.role === "guest"
                    ? "Guest Dashboard"
                    : "Dashboard"}
                </h1>
              </div>
            </div>
          )}

          <main
            className={`flex-1 relative overflow-y-auto focus:outline-none p-4 mt-16 ${
              menuType === "floating" ? "sm:pl-24 md:pl-28" : ""
            }`}
          >
            {children}
          </main>
        </div>

        {/* Chat buttons */}
        <div className="fixed bottom-4 right-4 z-[90] flex flex-col space-y-3">
          {/* AI Chat Button */}
          <button
            onClick={handleOpenAIChat}
            className="bg-purple-600 text-white p-3 rounded-full shadow-xl hover:bg-purple-700 focus:outline-none relative"
            title="AI Chat Assistant"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.051l.884.442c.396.198.598.628.425 1.04l-.774 1.84m0-7.106a24.301 24.301 0 00-4.5 0m0 0l.774 1.84c.173.412-.029.842-.425 1.04l-.884.442a2.25 2.25 0 00-1.357 2.051v5.714m7.5 0a2.25 2.25 0 001.591-.659l5.091-5.092m-5.091 5.092a2.25 2.25 0 01-1.591.659H9.75m0-6.75v6.75m3-12h-6"
              />
            </svg>
          </button>

          {/* Group Chat Button - only for students and admins */}
          {canUseGroupChat && (
            <button
              onClick={handleOpenGroupChat}
              className="bg-green-600 text-white p-3 rounded-full shadow-xl hover:bg-green-700 focus:outline-none relative"
              title="Class Group Chat"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {groups.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {groups.length}
                </span>
              )}
            </button>
          )}

          {/* Regular Chat Button */}
          <button
            onClick={handleOpenChat}
            className="bg-indigo-600 text-white p-3 rounded-full shadow-xl hover:bg-indigo-700 focus:outline-none relative"
            title="Private Chat"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Chat popup */}
        {isChatOpen && (
          <div className="fixed bottom-28 right-4 z-[90] w-11/12 md:w-96 h-[500px] max-w-md mx-auto md:mx-0 left-0 right-0 md:left-auto md:right-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-chat-open">
            <div className="flex justify-between items-center p-3 bg-indigo-600 text-white">
              <h3 className="font-medium">Chat Messages</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="h-5 w-5"
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
            </div>
            <div className="h-[calc(100%-48px)]">
              <Chat />
            </div>
          </div>
        )}

        {/* Group Chat popup */}
        {isGroupChatOpen && (
          <div className="fixed bottom-28 right-4 z-[90] w-11/12 md:w-96 h-[500px] max-w-md mx-auto md:mx-0 left-0 right-0 md:left-auto md:right-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-chat-open">
            <div className="flex justify-between items-center p-3 bg-green-600 text-white">
              <h3 className="font-medium">Class Groups</h3>
              <button
                onClick={() => setIsGroupChatOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="h-5 w-5"
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
            </div>
            <div className="h-[calc(100%-48px)]">
              <GroupChat />
            </div>
          </div>
        )}

        {/* AI Chat popup */}
        {isAIChatOpen && (
          <div className="fixed bottom-28 right-4 z-[90] w-11/12 md:w-96 h-[500px] max-w-md mx-auto md:mx-0 left-0 right-0 md:left-auto md:right-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-chat-open">
            <div className="h-[calc(100%)]">
              <AIChat onClose={() => setIsAIChatOpen(false)} />
            </div>
          </div>
        )}

        {/* Joke notification for specific user */}
        <JokeNotification />
      </div>
    </ClickSpark>
  );
};

export default DashboardLayout;
