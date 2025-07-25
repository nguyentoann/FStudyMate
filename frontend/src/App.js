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
import StudentIdVerificationTester from "./components/StudentIdVerificationTester";

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
                  
                  {/* Student ID Verification Tester */}
                  <Route
                    path="/verify-id-card-test"
                    element={
                      <ProtectedRoute allowedRoles={["admin"]}>
                        <StudentIdVerificationTester />
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
                  background-color: #121212 !important;
                  color: #f3f4f6 !important;
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
            </ThemeProvider>
          </DirectWebRTCProvider>
        </GroupChatProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

// Thêm route mới trong phần Routes

export default App;
