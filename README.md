# FStudyMate - Learning Management System


![image](https://github.com/user-attachments/assets/bf067d0f-71a8-42fe-a555-3418b8876b17)


FStudyMate is a comprehensive learning management system designed specifically for FPT University students. It provides course materials, mock exams, progress tracking, and interactive learning features to enhance the educational experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Frontend Architecture](#frontend-architecture)
  - [Component Structure](#component-structure)
  - [State Management](#state-management)
  - [Routing](#routing)
  - [Styling](#styling)
- [Backend Architecture](#backend-architecture)
  - [API Endpoints](#api-endpoints)
  - [Database Schema](#database-schema)
- [Advanced Features](#advanced-features)
  - [Math Rendering with KaTeX](#math-rendering-with-katex)
  - [Real-time Video Calls](#real-time-video-calls)
  - [User Activity Tracking](#user-activity-tracking)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

FStudyMate serves as a centralized platform for educational resources, tailored specifically to the needs of FPT University students. It facilitates access to course materials, offers mock exams mirroring the structure of official university tests, and provides personalized tracking of academic progress.

## ✨ Features

- **Authentication & Authorization**
  - Multi-role support (Student, Lecturer, Admin, Guest)
  - Role-based access control
  - Secure login with JWT

- **Learning Resources**
  - Access to course materials organized by subject, term, and class
  - Support for various content formats (documents, videos, slides)
  - Math formula rendering with KaTeX

- **Mock Exams**
  - Exams matching FPT's PE/FE/ME format
  - Multiple choice, coding, and practical test support
  - Timed assessment with auto-submission
  - Randomized question ordering

- **Dashboard & Analytics**
  - Personalized progress tracking
  - Performance analytics
  - Weak areas identification

- **Communication Tools**
  - Real-time video calls
  - Integrated chat system
  - Group discussions

- **User Interface**
  - Responsive design for all devices
  - Light/dark mode support
  - Animated UI components

## 🛠️ Tech Stack

### Frontend
- **React**: UI library
- **React Router**: Navigation and routing
- **Context API**: State management
- **Tailwind CSS**: Styling
- **KaTeX**: Math formula rendering
- **Draft.js**: Rich text editing
- **Simple-Peer**: WebRTC video calls
- **Axios**: API requests

### Backend
- **Spring Boot**: Java backend framework
- **Spring Security**: Authentication and authorization
- **JPA/Hibernate**: ORM for database operations
- **MySQL**: Relational database
- **JWT**: Authentication tokens

## 📂 Project Structure

```
FStudyMate/
├── frontend/                # React frontend application
│   ├── public/              # Static files
│   │   ├── src/
│   │   │   ├── assets/          # Images, fonts, etc.
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── context/         # React context providers
│   │   │   ├── pages/           # Page components
│   │   │   │   ├── admin/       # Admin dashboard pages
│   │   │   │   ├── dashboards/  # User dashboards
│   │   │   │   ├── lecturer/    # Lecturer-specific pages
│   │   │   ├── services/        # API service functions
│   │   │   ├── styles/          # Global styles
│   │   │   ├── utils/           # Utility functions
│   │   │   ├── App.js           # Main app component & routes
│   │   │   └── index.js         # Application entry point
│   │   ├── package.json         # Frontend dependencies
│   │   └── tailwind.config.js   # Tailwind CSS configuration
│   ├── src/                     # Backend source code
│   │   ├── main/
│   │   │   ├── java/            # Java source files
│   │   │   │   └── com/fstudymate/
│   │   │   │       ├── config/  # Application configuration
│   │   │   │       ├── controller/ # API endpoints
│   │   │   │       ├── model/   # Data models
│   │   │   │       ├── repository/ # Database access
│   │   │   │       ├── service/ # Business logic
│   │   │   │       └── util/    # Utility classes
│   │   │   └── resources/       # Configuration files
│   │   └── test/                # Test files
│   ├── pom.xml                  # Maven configuration
│   └── README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- JDK 21
- Node.js 16+ and npm
- MySQL database
- Git

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/FStudyMate.git
cd FStudyMate
```

2. **Configure the database**

Create a MySQL database named `fstudymate` and configure the connection in `src/main/resources/application.properties`.

3. **Install frontend dependencies**

```bash
cd frontend
npm install
```

### Running the Application

#### Development Mode

**Backend (Spring Boot)**

```bash
# Using Maven
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run
```

**Frontend (React)**

```bash
cd frontend
npm start
```

Access the application at http://localhost:3000

#### Production Build

1. **Build the React frontend**

```bash
cd frontend
npm run build
```

2. **Build the Spring Boot application**

```bash
./mvnw clean package
```

3. **Run the production application**

```bash
java -jar -Dspring.profiles.active=prod target/FStudyMate-1.0-SNAPSHOT.jar
```

The application will be available at http://localhost:8080

## 🏗️ Frontend Architecture

### Component Structure

The React frontend follows a component-based architecture organized by feature and functionality:

- **Layout Components**: Define the overall page structure (e.g., `DashboardLayout`)
- **Page Components**: Represent full pages (e.g., `LecturerDashboard`, `QuizGame`)
- **Feature Components**: Implement specific features (e.g., `VideoCall`, `QuizManager`)
- **UI Components**: Reusable UI elements (e.g., `Button`, `Card`)

### State Management

- **Context API**: Used for global state management
  - `AuthContext`: Manages user authentication state
  - `ThemeContext`: Handles light/dark mode preferences
  - `ChatContext`: Manages chat functionality
  - `GroupChatContext`: Handles group chat state
  - `DirectWebRTCContext`: Manages video call state

### Routing

React Router v6 is used for navigation with protected routes ensuring role-based access:

- `AuthenticatedRedirect`: Redirects users based on login status
- `ProtectedRoute`: Restricts access based on user roles

### Styling

- **Tailwind CSS**: Primary styling solution
- **Custom CSS**: Used for animations and complex components
- **CSS-in-JS**: For dynamic styling based on component state

## 🧩 Advanced Features

### Math Rendering with KaTeX

The application supports rendering mathematical formulas using KaTeX:

```jsx
// Example of math rendering
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

<ReactMarkdown 
  remarkPlugins={[remarkMath]} 
  rehypePlugins={[rehypeKatex]}
>
  {content}
</ReactMarkdown>
```

### Real-time Video Calls

The application implements WebRTC for peer-to-peer video calls:

- Uses Simple-Peer for WebRTC signaling
- Supports one-to-one video conversations
- Features include mute, camera toggle, and call end

### User Activity Tracking

The system tracks user activity to provide personalized analytics:

- Page visits and time spent
- Quiz attempts and performance
- Learning material interaction

## 📦 Deployment

### Server Requirements

- JDK 21
- MySQL Server
- Minimum 2GB RAM
- 10GB storage

### Deployment Steps

1. Build the application as described in the "Production Build" section
2. Configure a production database in `application-prod.properties`
3. Run with production profile:

```bash
java -jar -Dspring.profiles.active=prod target/FStudyMate-1.0-SNAPSHOT.jar
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Created by FPT University Students for the FPT University Community. 
