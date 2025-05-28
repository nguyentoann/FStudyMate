# FStudyMate Component Documentation

This document provides detailed information about key components in the FStudyMate application.

## Table of Contents

- [Layout Components](#layout-components)
  - [DashboardLayout](#dashboardlayout)
- [Authentication Components](#authentication-components)
  - [AuthenticatedRedirect](#authenticatedredirect)
  - [ProtectedRoute](#protectedroute)
- [Dashboard Components](#dashboard-components)
  - [LecturerDashboard](#lecturerdashboard)
  - [StudentDashboard](#studentdashboard)
  - [AdminDashboard](#admindashboard)
- [Quiz Components](#quiz-components)
  - [QuizManager](#quizmanager)
  - [CreateQuiz](#createquiz)
  - [QuizGame](#quizgame)
- [Communication Components](#communication-components)
  - [VideoCall](#videocall)
  - [IncomingCallNotification](#incomingcallnotification)
- [UI Components](#ui-components)
  - [ThemeToggle](#themetoggle)
  - [MarkdownTableRenderer](#markdowntablerenderer)

## Layout Components

### DashboardLayout

**Path**: `frontend/src/components/DashboardLayout.js`

**Description**: The main layout component used for all dashboard pages. It provides a consistent UI with a sidebar navigation menu, header, and content area.

**Props**:
- `children`: React nodes to render in the content area
- `fullWidth` (optional): Boolean to use full width layout instead of padded container

**Usage Example**:
```jsx
import DashboardLayout from '../../components/DashboardLayout';

const MyPage = () => {
  return (
    <DashboardLayout>
      <div>My page content goes here</div>
    </DashboardLayout>
  );
};
```

## Authentication Components

### AuthenticatedRedirect

**Path**: `frontend/src/components/AuthenticatedRedirect.js`

**Description**: Redirects authenticated users to their appropriate dashboard based on their role. Unauthenticated users see the default content (usually the landing page).

**Props**:
- `children`: React nodes to render for unauthenticated users

**Usage Example**:
```jsx
<Route path="/" element={
  <AuthenticatedRedirect>
    <LandingPage />
  </AuthenticatedRedirect>
} />
```

### ProtectedRoute

**Path**: `frontend/src/components/ProtectedRoute.js`

**Description**: Protects routes by checking if the user is authenticated and has the required role. Redirects to login page if not authenticated or shows access denied if authenticated but lacking permissions.

**Props**:
- `children`: React nodes to render if user has access
- `allowedRoles` (optional): Array of role strings that are allowed to access the route

**Usage Example**:
```jsx
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

## Dashboard Components

### LecturerDashboard

**Path**: `frontend/src/pages/dashboards/LecturerDashboard.js`

**Description**: Dashboard for lecturers to manage course materials, view statistics, and handle OCR for document scanning.

**Key Features**:
- Course material management with markdown editor
- OCR scanning for document text extraction
- Analytics on student engagement
- Quiz management integration

**State Management**:
- Uses `useAuth` context for user information
- Manages local state for course materials, OCR processing, and UI modes

### StudentDashboard

**Path**: `frontend/src/pages/dashboards/StudentDashboard.js`

**Description**: Dashboard for students to access course materials, take quizzes, and view their progress.

**Key Features**:
- Course material viewing by subject
- Quiz access and history
- Progress tracking and analytics
- Upcoming schedule display

### AdminDashboard

**Path**: `frontend/src/pages/dashboards/AdminDashboard.js`

**Description**: Dashboard for administrators to manage system settings and user accounts.

**Key Features**:
- User management with CRUD operations
- System settings configuration
- Role-based access control

## Quiz Components

### QuizManager

**Path**: `frontend/src/pages/lecturer/QuizManager.js`

**Description**: Interface for lecturers to manage quizzes, including creation, editing, and viewing results.

**Key Features**:
- Quiz listing with filtering and search
- Quiz deletion with confirmation
- Navigation to quiz creation and editing
- Status badges for quiz states (active, draft, completed)

**API Integration**:
- Fetches quizzes from `/quizzes/lecturer/:id` endpoint
- Handles quiz deletion via DELETE to `/quizzes/:id`

### CreateQuiz

**Path**: `frontend/src/pages/lecturer/CreateQuiz.js`

**Description**: Form interface for creating new quizzes or editing existing ones.

**Key Features**:
- Multi-step form with quiz details and questions
- Support for different question types
- Preview mode for questions
- Save as draft or publish options

**State Management**:
- Manages form state for quiz metadata and questions
- Handles validation and API submissions

### QuizGame

**Path**: `frontend/src/components/QuizGame.js`

**Description**: Interactive quiz game interface with gamified elements to make quiz-taking more engaging.

**Key Features**:
- Animated game UI with dragon character
- Interactive answer selection mechanism
- Score tracking and immediate feedback
- Timer visualization

## Communication Components

### VideoCall

**Path**: `frontend/src/components/VideoCall.js`

**Description**: WebRTC-based video call component for real-time communication between users.

**Key Features**:
- Peer-to-peer video and audio streaming
- Camera and microphone controls
- Call status indication
- Fullscreen mode

**Context Integration**:
- Uses `DirectWebRTCContext` for call state management

### IncomingCallNotification

**Path**: `frontend/src/components/IncomingCallNotification.js`

**Description**: Notification component that appears when a user receives an incoming call.

**Key Features**:
- Displays caller information
- Provides accept/reject buttons
- Plays notification sound
- Auto-dismisses after timeout

## UI Components

### ThemeToggle

**Path**: `frontend/src/components/ThemeToggle.js`

**Description**: Toggle button for switching between light and dark theme modes.

**Key Features**:
- Animated transition between modes
- Persists preference in local storage
- Floating position for easy access

**Context Integration**:
- Uses `ThemeContext` for theme state management

### MarkdownTableRenderer

**Path**: `frontend/src/components/MarkdownTableRenderer.js`

**Description**: Custom renderer for markdown tables with enhanced styling and functionality.

**Props**:
- `content`: Markdown string containing table markup

**Usage Example**:
```jsx
import MarkdownTableRenderer from '../../components/MarkdownTableRenderer';

<MarkdownTableRenderer content={tableMarkdown} />
```

## Context Providers

The application uses several context providers for state management:

### AuthContext

**Path**: `frontend/src/context/AuthContext.js`

**Description**: Manages authentication state, user information, and authentication-related functions.

**Key Exports**:
- `AuthProvider`: Context provider component
- `useAuth`: Hook for consuming auth context

**Methods**:
- `login(credentials)`: Authenticates user with provided credentials
- `logout()`: Logs out the current user
- `register(userData)`: Registers a new user
- `updateProfile(data)`: Updates user profile information

### ThemeContext

**Path**: `frontend/src/context/ThemeContext.js`

**Description**: Manages application theme state (light/dark mode).

**Key Exports**:
- `ThemeProvider`: Context provider component
- `useTheme`: Hook for consuming theme context

**Methods**:
- `toggleDarkMode()`: Switches between light and dark mode

### ChatContext & GroupChatContext

**Path**: 
- `frontend/src/context/ChatContext.js`
- `frontend/src/context/GroupChatContext.js`

**Description**: Manages one-to-one and group chat functionality respectively.

**Key Features**:
- Message history management
- Real-time message delivery
- Chat status tracking
- User presence indicators

### DirectWebRTCContext

**Path**: `frontend/src/context/DirectWebRTCContext.js`

**Description**: Manages WebRTC video call state and signaling.

**Key Features**:
- Call initialization and termination
- Media stream management
- Connection state tracking
- Call metadata handling 