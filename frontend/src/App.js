import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword.js";
import ResetPassword from "./pages/ResetPassword.js";
import Profile from "./pages/Profile";
import PasswordChange from "./pages/PasswordChange";
import UserManagement from "./pages/admin/UserManagement";
import UserEdit from "./pages/admin/UserEdit";
import MathTest from "./pages/MathTest";
import NotificationTestPage from "./pages/NotificationTestPage";
import AuthenticatedRedirect from "./components/AuthenticatedRedirect";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { GroupChatProvider } from "./context/GroupChatContext";
import DirectWebRTCProvider from "./context/DirectWebRTCContext";
import ThemeToggle from "./components/ThemeToggle";
import EnhancedVideoCall from "./components/EnhancedVideoCall";
import EnhancedIncomingCallNotification from "./components/EnhancedIncomingCallNotification";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import LecturerDashboard from "./pages/dashboards/LecturerDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import GuestDashboard from "./pages/dashboards/GuestDashboard";
import OutsrcStudentDashboard from "./pages/dashboards/OutsrcStudentDashboard";
import LandingPage from "./pages/LandingPage";
import QuizGamePage from "./pages/QuizGamePage";
import VerifyOtp from "./pages/VerifyOtp";
import CalendarPage from "./pages/CalendarPage";
import TeachingScheduleManager from "./pages/admin/TeachingScheduleManager";
import StudentScheduleView from "./pages/student/StudentScheduleView";

// import DeveloperTools from './components/DeveloperTools';
import QuizManager from "./pages/lecturer/QuizManager";
import CreateQuiz from "./pages/lecturer/CreateQuiz";
import QuestionBankManager from "./pages/lecturer/QuestionBankManager";
import BlueCursor from "./components/BlueCursor";
import AppTheme from "./pages/AppTheme";
import AboutUs from "./pages/AboutUs";
import QuizHistory from "./pages/QuizHistory";
import QuizDetails from "./pages/QuizDetails";
import QuizReview from "./pages/QuizReview";
import QuizContinue from "./pages/QuizContinue";
import "./styles/globals.css";
import Course from "./pages/Course";
import ClassManagement from "./pages/admin/ClassManagement";
import FeedbackPage from "./pages/help/FeedbackPage";
import FAQPage from "./pages/help/FAQPage";
import WebRTCCall from "./components/WebRTCCall";
import RoomManagement from "./pages/admin/RoomManagement";
import RoomControlPanel from "./pages/admin/RoomControlPanel";
import MaterialsView from "./components/MaterialsView";
import GlassCardDemo from "./components/GlassCardDemo";
import AntDesignThemeProvider from "./components/AntDesignThemeProvider";
import AntDesignDemo from "./components/AntDesignDemo";
import DarkModeExemptDemo from "./components/DarkModeExemptDemo";
import DashboardButtonsExample from "./components/DashboardButtonsExample";
import AntTagExample from "./components/AntTagExample";
import CalendarPageTabsDemo from "./components/CalendarPageTabsDemo";
import AntTagPreserveDemo from "./components/AntTagPreserveDemo";
import TableDarkModeDemo from "./components/TableDarkModeDemo";
import CalendarHeaderDarkModeDemo from "./components/CalendarHeaderDarkModeDemo";

// Show developer tools only in development environment
// const isDevelopment = process.env.NODE_ENV === 'development' ||
//                      window.location.hostname === 'localhost' ||
//                      window.location.hostname === '127.0.0.1';

// Thêm import cho trang MyCourses
import MyCoursesPage from "./pages/MyCourses";
// Thêm import cho trang Classes
import ClassesPage from "./pages/ClassesPage";
// Import Learning Materials pages
import LearningMaterialsPage from "./pages/LearningMaterialsPage";
import SubjectMaterialsPage from "./pages/SubjectMaterialsPage";
// Import Search Page
import SearchPage from "./pages/SearchPage";

function App() {
  useEffect(() => {
    console.log("App component mounted");
    console.log("Available routes:", [
      "/",
      "/home",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      // ... other routes
    ]);
  }, []);

  return (
    <AuthProvider>
      <ChatProvider>
        <GroupChatProvider>
          <DirectWebRTCProvider>
            <ThemeProvider>
              <AntDesignThemeProvider>
                <Router>
                  {/* <BlueCursor /> */}
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <AuthenticatedRedirect>
                          <LandingPage />
                        </AuthenticatedRedirect>
                      }
                    />
                    <Route
                      path="/home"
                      element={
                        <AuthenticatedRedirect>
                          <Home />
                        </AuthenticatedRedirect>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/verify-otp" element={<VerifyOtp />} />
                    <Route path="/math-test" element={<MathTest />} />
                    {/* Quiz routes */}
                    <Route
                      path="/quiz"
                      element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz/:maMon/:maDe"
                      element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      }
                    />
                    {/* Quiz Game routes */}
                    <Route
                      path="/quiz-game"
                      element={
                        <ProtectedRoute>
                          <QuizGamePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz-game/:maMon/:maDe"
                      element={
                        <ProtectedRoute>
                          <QuizGamePage />
                        </ProtectedRoute>
                      }
                    />
                    {/* Quiz History routes */}
                    <Route
                      path="/quiz-history"
                      element={
                        <ProtectedRoute>
                          <QuizHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz-details/:quizTakenId"
                      element={
                        <ProtectedRoute>
                          <QuizDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/review/:quizTakenId"
                      element={
                        <ProtectedRoute>
                          <QuizReview />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz/:quizId/continue"
                      element={
                        <ProtectedRoute>
                          <QuizContinue />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/quiz/attempt/:quizTakenId"
                      element={
                        <ProtectedRoute>
                          <Quiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/change-password"
                      element={
                        <ProtectedRoute>
                          <PasswordChange />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/theme"
                      element={
                        <ProtectedRoute>
                          <AppTheme />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/help/about"
                      element={
                        <ProtectedRoute>
                          <AboutUs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <StudentDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/student/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["student"]}>
                          <StudentDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lecturer/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["lecturer"]}>
                          <LecturerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/guest/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["guest"]}>
                          <GuestDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/outsource/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={["outsrc_student"]}>
                          <OutsrcStudentDashboard />
                        </ProtectedRoute>
                      }
                    />
                    {/* Admin routes */}
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <UserManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users/:userId"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <UserEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/room-management"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <RoomManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/room-control"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "lecturer"]}>
                          <RoomControlPanel />
                        </ProtectedRoute>
                      }
                    />
                    {/* Quiz Manager routes */}
                    <Route
                      path="/lecturer/quiz-manager"
                      element={
                        <ProtectedRoute allowedRoles={["lecturer"]}>
                          <QuizManager />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lecturer/create-quiz"
                      element={
                        <ProtectedRoute allowedRoles={["lecturer"]}>
                          <CreateQuiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lecturer/edit-quiz/:id"
                      element={
                        <ProtectedRoute allowedRoles={["lecturer"]}>
                          <CreateQuiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lecturer/clone-quiz/:id"
                      element={
                        <ProtectedRoute allowedRoles={["lecturer"]}>
                          <CreateQuiz />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/lecturer/question-bank"
                      element={
                        <ProtectedRoute allowedRoles={["lecturer"]}>
                          <QuestionBankManager />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-courses"
                      element={
                        <ProtectedRoute>
                          <MyCoursesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/classes"
                      element={
                        <ProtectedRoute>
                          <ClassesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/classes"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <ClassManagement />
                        </ProtectedRoute>
                      }
                    />
                    ;{/* Calendar routes */}
                    <Route
                      path="/calendar"
                      element={
                        <ProtectedRoute>
                          <CalendarPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/schedule"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "lecturer"]}>
                          <TeachingScheduleManager />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/student/schedule"
                      element={
                        <ProtectedRoute allowedRoles={["student"]}>
                          <StudentScheduleView />
                        </ProtectedRoute>
                      }
                    />
                    {/* Notification System Routes */}
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <NotificationTestPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/notifications"
                      element={
                        <ProtectedRoute allowedRoles={["admin", "lecturer"]}>
                          <NotificationTestPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Learning Materials routes */}
                    <Route
                      path="/materials"
                      element={
                        <ProtectedRoute>
                          <LearningMaterialsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/materials/subject/:subjectCode"
                      element={
                        <ProtectedRoute>
                          <SubjectMaterialsPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Feedback Route */}
                    <Route
                      path="/help/feedback"
                      element={
                        <ProtectedRoute>
                          <FeedbackPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/help/faq"
                      element={
                        <ProtectedRoute>
                          <FAQPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Search Route */}
                    <Route
                      path="/search"
                      element={
                        <ProtectedRoute>
                          <SearchPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* WebRTC Video Call */}
                    <Route
                      path="/webrtc"
                      element={
                        <ProtectedRoute>
                          <WebRTCCall />
                        </ProtectedRoute>
                      }
                    />

                    {/* Materials route */}
                    <Route
                      path="/materials"
                      element={
                        <ProtectedRoute>
                          <MaterialsView />
                        </ProtectedRoute>
                      }
                    />

                    {/* Glass Card Demo route */}
                    <Route
                      path="/demo/glass-card"
                      element={
                        <ProtectedRoute>
                          <GlassCardDemo />
                        </ProtectedRoute>
                      }
                    />

                    {/* Ant Design Demo route */}
                    <Route
                      path="/demo/ant-design"
                      element={
                        <ProtectedRoute>
                          <AntDesignDemo />
                        </ProtectedRoute>
                      }
                    />

                    {/* Dark Mode Exempt Demo route */}
                    <Route
                      path="/demo/dark-mode-exempt"
                      element={
                        <ProtectedRoute>
                          <DarkModeExemptDemo />
                        </ProtectedRoute>
                      }
                    />

                    {/* Dashboard Buttons Example route */}
                    <Route
                      path="/demo/dashboard-buttons"
                      element={
                        <ProtectedRoute>
                          <DashboardButtonsExample />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Ant Tag Example route */}
                    <Route
                      path="/demo/ant-tags"
                      element={
                        <ProtectedRoute>
                          <AntTagExample />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Calendar Page Tabs Demo route */}
                    <Route
                      path="/demo/calendar-tabs"
                      element={
                        <ProtectedRoute>
                          <CalendarPageTabsDemo />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Ant Tag Preserve Demo route */}
                    <Route
                      path="/demo/ant-tags-preserve"
                      element={
                        <ProtectedRoute>
                          <AntTagPreserveDemo />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Table Dark Mode Demo route */}
                    <Route
                      path="/demo/table-dark-mode"
                      element={
                        <ProtectedRoute>
                          <TableDarkModeDemo />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Calendar Header Dark Mode Demo route */}
                    <Route
                      path="/demo/calendar-header-dark-mode"
                      element={
                        <ProtectedRoute>
                          <CalendarHeaderDarkModeDemo />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* 404 Route - must be last */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <ThemeToggle />
                  {/* Video Call Components */}
                  <EnhancedVideoCall />
                  <EnhancedIncomingCallNotification />
                  {/* {isDevelopment && <DeveloperTools />} */}
                </Router>

                {/* Global CSS for dark mode */}
                <style jsx global>{`
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                    }
                    to {
                      opacity: 1;
                    }
                  }

                  @keyframes zoomIn {
                    from {
                      transform: scale(0.8);
                      opacity: 0;
                    }
                    to {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }

                  @keyframes slideInUp {
                    from {
                      transform: translateY(20px);
                      opacity: 0;
                    }
                    to {
                      transform: translateY(0);
                      opacity: 1;
                    }
                  }

                  @keyframes slideOutDown {
                    from {
                      transform: translateY(0);
                      opacity: 1;
                    }
                    to {
                      transform: translateY(20px);
                      opacity: 0;
                    }
                  }

                  .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                  }

                  .animate-zoomIn {
                    animation: zoomIn 0.3s ease-out;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                  }

                  .animate-chat-open {
                    animation: slideInUp 0.3s ease-out;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                  }

                  .animate-chat-close {
                    animation: slideOutDown 0.3s ease-in;
                    animation-fill-mode: forwards;
                    animation-iteration-count: 1;
                  }

                  body.dark-mode {
                    background-color: #0f172a !important;
                    color: #f3f4f6 !important;
                  }
                  
                  /* Apply dark background only to containers */
                  body.dark-mode div:not(.search-bar):not(.search-bar *) {
                    background-color: transparent;
                  }
                  
                  /* Direct fix for specific class combinations */
                  body.dark-mode .bg-white.rounded-lg.shadow,
                  body.dark-mode .bg-white.rounded-lg, 
                  body.dark-mode div[class*="bg-white"][class*="rounded-lg"][class*="shadow"],
                  body.dark-mode div[class*="bg-white"][class*="rounded-lg"][class*="p-6"] {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                  }
                  
                  /* Dark mode for specific containers */
                  body.dark-mode .card,
                  body.dark-mode .shadow,
                  body.dark-mode .shadow-sm,
                  body.dark-mode .shadow-md,
                  body.dark-mode .shadow-lg,
                  body.dark-mode .shadow-xl,
                  body.dark-mode .bg-white,
                  body.dark-mode .bg-gray-50,
                  body.dark-mode .bg-gray-100 {
                    background-color: #1e293b !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Dashboard stat containers and metrics */
                  body.dark-mode [class*="stat"],
                  body.dark-mode [class*="card"],
                  body.dark-mode [class*="metric"],
                  body.dark-mode [class*="score"],
                  body.dark-mode [class*="quiz"],
                  body.dark-mode [class*="average"],
                  body.dark-mode [class*="total"],
                  body.dark-mode [class*="count"],
                  body.dark-mode #quizzes-taken,
                  body.dark-mode #average-score,
                  body.dark-mode #total-points,
                  body.dark-mode #completion-rate {
                    background-color: #1e293b !important;
                  }
                  
                  /* Button styling in dark mode */
                  body.dark-mode button:not([class*="bg-"]):not(.search-bar *) {
                    background-color: #334155 !important;
                  }
                  
                  /* Ensure text is visible, except for specific elements that should retain their colors */
                  body.dark-mode h1, 
                  body.dark-mode h2, 
                  body.dark-mode h3, 
                  body.dark-mode h4, 
                  body.dark-mode h5, 
                  body.dark-mode h6,
                  body.dark-mode p, 
                  body.dark-mode a:not([class*="calendar"]):not([class*="event"]):not([class*="schedule"]) {
                    color: #f3f4f6 !important;
                  }
                  
                  /* Make sure question text is dark mode compatible */
                  body.dark-mode .question,
                  body.dark-mode [class*="question"],
                  body.dark-mode h3.text-lg,
                  body.dark-mode .text-blue-600,
                  body.dark-mode .font-semibold.text-blue-600,
                  body.dark-mode .font-semibold.text-gray-800 {
                    color: #f3f4f6 !important;
                  }
                  
                  /* Course materials text - specific fix */
                  body.dark-mode [class*="materials-description"],
                  body.dark-mode [class*="materials"] p,
                  body.dark-mode [class*="course"] p {
                    color: #94a3b8 !important;
                  }
                  
                  /* Fix for ant-table-thead elements in dark mode */
                  body.dark-mode .ant-table-thead > tr > th,
                  body.dark-mode [class*="ant-table-thead"],
                  body.dark-mode .ant-table-thead th.ant-table-column-sort,
                  body.dark-mode th.ant-table-cell {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Fix for search-container elements */
                  body.dark-mode [class*="search-container"],
                  body.dark-mode .search-container,
                  body.dark-mode .search-container input,
                  body.dark-mode [class*="search-container"] input {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Quiz and Question section styles for dark mode */
                  body.dark-mode [class*="quiz-container"],
                  body.dark-mode [class*="question-container"],
                  body.dark-mode div[class*="question-box"],
                  body.dark-mode div[class*="question-wrapper"],
                  body.dark-mode div[class*="question-content"] {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Target quiz question text and title */
                  body.dark-mode [class*="question-title"],
                  body.dark-mode h2[class*="question"],
                  body.dark-mode h3[class*="question"],
                  body.dark-mode div[class*="question"] h2,
                  body.dark-mode div[class*="question"] h3,
                  body.dark-mode div[class*="question"] p {
                    color: #f3f4f6 !important;
                  }
                  
                  /* Quiz question content (the actual question text) */
                  body.dark-mode div[class*="question"] > div,
                  body.dark-mode [class*="question-text"] {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                  }
                  
                  /* Question options */
                  body.dark-mode [class*="option"],
                  body.dark-mode div[class*="option"],
                  body.dark-mode button[class*="option"] {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Fix for code blocks inside questions */
                  body.dark-mode pre,
                  body.dark-mode code {
                    background-color: #1a2234 !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Toggle colors for elements with dark styles */
                  body.dark-mode .min-h-screen.bg-gray-900 {
                    background-color: #0f172a !important;
                  }
                  
                  body.dark-mode .py-8.bg-gray-900 {
                    background-color: #0f172a !important;
                  }
                  
                  /* Toggle pre-existing dark backgrounds */
                  body.dark-mode .bg-gray-900 {
                    background-color: #0f172a !important;
                  }
                  
                  body.dark-mode .bg-gray-800 {
                    background-color: #1e293b !important;
                  }
                  
                  /* Toggle pre-existing light text */
                  body.dark-mode .text-white {
                    color: #94a3b8 !important;
                  }
                  
                  /* For specific combinations */
                  body.dark-mode .min-h-screen.py-8.bg-gray-900.text-white,
                  body.dark-mode .min-h-screen.py-8.bg-gray-900,
                  body.dark-mode .min-h-screen.bg-gray-900,
                  body.dark-mode .py-8.bg-gray-900 {
                    background-color: #0f172a !important;
                    color: #f3f4f6 !important;
                  }
                  
                  /* Light mode toggle */
                  body:not(.dark-mode) .min-h-screen.py-8.bg-gray-900.text-white,
                  body:not(.dark-mode) .min-h-screen.py-8.bg-gray-900,
                  body:not(.dark-mode) .min-h-screen.bg-gray-900,
                  body:not(.dark-mode) .py-8.bg-gray-900 {
                    background-color: #f3f4f6 !important;
                    color: #111827 !important;
                  }
                  
                  /* Universal bg class adjustments for dark mode */
                  
                  /* Light backgrounds */
                  body.dark-mode [class*="bg-white"],
                  body.dark-mode [class*="bg-gray-50"],
                  body.dark-mode [class*="bg-gray-100"],
                  body.dark-mode [class*="bg-gray-200"] {
                    background-color: #1e293b !important;
                  }
                  
                  /* Medium backgrounds */
                  body.dark-mode [class*="bg-gray-300"],
                  body.dark-mode [class*="bg-gray-400"],
                  body.dark-mode [class*="bg-gray-500"] {
                    background-color: #334155 !important;
                  }
                  
                  /* Dark backgrounds */
                  body.dark-mode [class*="bg-gray-600"],
                  body.dark-mode [class*="bg-gray-700"],
                  body.dark-mode [class*="bg-gray-800"],
                  body.dark-mode [class*="bg-gray-900"] {
                    background-color: #0f172a !important;
                  }
                  
                  /* Blue backgrounds */
                  body.dark-mode [class*="bg-blue-"] {
                    background-color: #1e3a8a !important;
                  }
                  
                  /* Green backgrounds */
                  body.dark-mode [class*="bg-green-"] {
                    background-color: #064e3b !important;
                  }
                  
                  /* Red backgrounds */
                  body.dark-mode [class*="bg-red-"] {
                    background-color: #7f1d1d !important;
                  }
                  
                  /* Elements that should retain their colors */
                  body.dark-mode [class*="calendar"],
                  body.dark-mode [class*="event"],
                  body.dark-mode [class*="schedule"],
                  body.dark-mode a[class*="calendar"],
                  body.dark-mode a[class*="event"],
                  body.dark-mode a[class*="schedule"] {
                    color: inherit !important;
                    background-color: inherit !important;
                  }
                  
                  /* Keep input fields dark in dark mode - standardize all search bars */
                  body.dark-mode input[type="text"],
                  body.dark-mode input[type="search"],
                  body.dark-mode [role="search"] input,
                  body.dark-mode [class*="search"] input,
                  body.dark-mode form[class*="search"] input,
                  body.dark-mode div[class*="search"] input {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                    padding-right: 2.5rem !important;
                  }
                  
                  /* Notification popups */
                  body.dark-mode [class*="notification"],
                  body.dark-mode [class*="toast"],
                  body.dark-mode [class*="popup"],
                  body.dark-mode [class*="modal"],
                  body.dark-mode [class*="dialog"],
                  body.dark-mode [role="dialog"],
                  body.dark-mode [role="alert"],
                  body.dark-mode [class*="alert"],
                  body.dark-mode [id*="notification"] {
                    background-color: #1e293b !important;
                    color: #f3f4f6 !important;
                    border-color: #475569 !important;
                  }
                  
                  /* Fix z-index for search bar */
                  .search-bar {
                    position: relative;
                    z-index: 9999;
                  }
                  
                  /* Preserve search bar styling in dark mode */
                  body.dark-mode .search-bar,
                  body.dark-mode .search-bar * {
                    background-color: white !important;
                    color: #111827 !important;
                  }

                  @keyframes float {
                    0% {
                      transform: translateY(0px);
                    }
                    50% {
                      transform: translateY(-10px);
                    }
                    100% {
                      transform: translateY(0px);
                    }
                  }

                  .animate-float {
                    animation: float 6s ease-in-out infinite;
                  }

                  @keyframes blob {
                    0% {
                      transform: scale(1) translate(0px, 0px);
                    }
                    33% {
                      transform: scale(1.05) translate(5px, -5px);
                    }
                    66% {
                      transform: scale(0.95) translate(-5px, 5px);
                    }
                    100% {
                      transform: scale(1) translate(0px, 0px);
                    }
                  }

                  .animate-blob {
                    animation: blob 8s ease-in-out infinite;
                  }
                `}</style>
              </AntDesignThemeProvider>
            </ThemeProvider>
          </DirectWebRTCProvider>
        </GroupChatProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

// Thêm route mới trong phần Routes

export default App;
