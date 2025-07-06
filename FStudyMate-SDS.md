# FStudyMate

## Software Design Specification

– Hanoi, August 2023 –

## Record of Changes

| Date       | A* M, D | In charge | Change Description          |
|------------|---------|-----------|----------------------------|
| 2023-08-20 | A       | Developer | Initial document creation  |
| 2023-08-25 | M       | Developer | Updated package diagrams   |
| 2023-09-01 | M       | Developer | Added video call component |
| 2023-09-10 | M       | Developer | Added AI quiz generation   |

*A - Added M - Modified D - Deleted

## Table of Contents

I. Overview
   1. Code Packages
   2. Database Design
      a. Database Schema
      b. Table Description

II. Code Designs
   1. Authentication and User Management
      a. Class Diagram
      b. Class Specifications
      c. Sequence Diagram(s)
      d. Database Queries
   2. Quiz Management
      a. Class Diagram
      b. Class Specifications
      c. Sequence Diagram(s)
      d. Database Queries
   3. Learning Resources
      a. Class Diagram
      b. Class Specifications
      c. Sequence Diagram(s)
      d. Database Queries
   4. Video Call System
      a. Class Diagram
      b. Class Specifications
      c. Sequence Diagram(s)
      d. WebRTC Implementation

## I. Overview

### 1. Code Packages

![Package Diagram](package-diagram.png)

Package descriptions:

| No | Package                    | Description                                                        |
|----|-----------------------------|-------------------------------------------------------------------|
| 01 | com.mycompany.fstudymate    | Main application package containing the Spring Boot application    |
| 02 | com.mycompany.fstudymate.api | REST API endpoints for external integrations                       |
| 03 | com.mycompany.fstudymate.config | Configuration classes for application setup, security, and CORS    |
| 04 | com.mycompany.fstudymate.controller | REST controllers handling HTTP requests                           |
| 05 | com.mycompany.fstudymate.dto | Data Transfer Objects for API communication                         |
| 06 | com.mycompany.fstudymate.model | Entity classes representing database tables                         |
| 07 | com.mycompany.fstudymate.repository | JPA repositories for database operations                           |
| 08 | com.mycompany.fstudymate.service | Service interfaces defining business logic                          |
| 09 | com.mycompany.fstudymate.util | Utility classes for common functionality                            |
| 10 | com.example | Secondary application package for authentication and basic operations |
| 11 | com.example.config | Security and MVC configuration classes                              |
| 12 | com.example.controller | Controllers for authentication and emergency operations            |
| 13 | com.example.model | Entity classes for user authentication                              |
| 14 | com.example.repository | Data repositories for authentication entities                      |
| 15 | com.example.service | Service interfaces for authentication                             |
| 16 | com.example.service.impl | Implementation classes for authentication services                |
| 17 | connection | Database connection utilities                                       |
| 18 | controller | Legacy servlet controllers                                          |
| 19 | dao | Data Access Objects for database operations                        |
| 20 | model | Domain model classes                                             |
| 21 | service | Business logic services                                          |
| 22 | util | General utility classes                                          |

### 2. Database Design

#### a. Database Schema

![Database Schema](db-schema.png)

#### b. Table Description

| No | Table               | Description                                                                |
|----|---------------------|----------------------------------------------------------------------------|
| 01 | users               | Stores user account information including authentication and profile data  |
| 02 | Quizzes             | Contains metadata about quizzes created by lecturers and AI               |
| 03 | Questions           | Stores individual quiz questions with answers and explanations            |
| 04 | QuizTaken           | Records quiz attempts by students with scores and analytics               |
| 05 | QuizPermissions     | Manages which classes can access specific quizzes                         |
| 06 | Subjects            | Contains academic subjects available in the system                        |
| 07 | Lessons             | Stores learning content associated with subjects                          |
| 08 | students            | Additional student-specific profile information                           |
| 09 | lecturers           | Additional lecturer-specific profile information                          |
| 10 | admins              | Administrative user details and permission levels                         |
| 11 | guests              | Guest user information                                                    |
| 12 | outsource_students  | External student information                                              |
| 13 | user_sessions       | Records user login sessions and activity                                  |
| 14 | user_activity_details | Detailed tracking of user activity and device information                |
| 15 | chat_groups         | Information about group chat rooms                                        |
| 16 | chat_messages       | Direct messages between users                                             |
| 17 | group_chat_messages | Messages sent in group chats                                              |
| 18 | chat_files          | Files shared in chat conversations                                        |
| 19 | chat_message_files  | Mapping between messages and attached files                               |
| 20 | ai_chat_messages    | Stores conversations with the AI chat assistant                           |

## II. Code Designs

### 1. Authentication and User Management

#### a. Class Diagram

```
   User
   +------------------+
   | -id: Integer     |
   | -username: String|
   | -email: String   |
   | -password: String|
   | -role: String    |
   | -fullName: String|
   +------------------+
   | +getId()         |
   | +getUsername()   |
   | +setRole()       |
   | +setPassword()   |
   +------------------+
          ^
          |
   +------+------+------+
   |             |      |
   |             |      |
Student      Lecturer  Admin
```

#### b. Class Specifications

User Class:
The User class is the core entity for authentication and authorization in the system.

| No | Method | Description |
|----|--------|-------------|
| 01 | getId() | Returns the unique identifier of the user |
| 02 | getUsername() | Returns the username used for login |
| 03 | getEmail() | Returns the user's email address |
| 04 | getRole() | Returns the user's role (student, lecturer, admin, guest) |
| 05 | setId(Integer id) | Sets the user's ID |
| 06 | setUsername(String username) | Sets the user's username |
| 07 | setEmail(String email) | Sets the user's email |
| 08 | setPassword(String password) | Sets the user's password (hashed) |
| 09 | setRole(String role) | Sets the user's role |

AuthService Class:
Provides authentication and user management functionality.

| No | Method | Description |
|----|--------|-------------|
| 01 | login(String username, String password) | Authenticates a user and returns a session token |
| 02 | register(User user) | Creates a new user account |
| 03 | verifyToken(String token) | Validates a user's authentication token |
| 04 | resetPassword(String email) | Initiates password reset process |
| 05 | changePassword(Integer userId, String oldPassword, String newPassword) | Changes a user's password |
| 06 | getUserById(Integer id) | Retrieves a user by their ID |

#### c. Sequence Diagram

```
User Login Flow:

User -> Frontend: Enter credentials
Frontend -> AuthController: POST /api/auth/login
AuthController -> AuthService: login(username, password)
AuthService -> UserRepository: findByUsername(username)
UserRepository -> Database: SELECT * FROM users WHERE username = ?
Database -> UserRepository: User object
UserRepository -> AuthService: User object
AuthService -> AuthService: validatePassword(password, user.passwordHash)
AuthService -> AuthController: Authentication token
AuthController -> Frontend: User data with token
Frontend -> User: Redirect to dashboard
```

#### d. Database Queries

```sql
-- User Authentication
SELECT * FROM users WHERE username = ? AND password_hash = ?;

-- User Registration
INSERT INTO users (username, email, password_hash, role, full_name, created_at) 
VALUES (?, ?, ?, ?, ?, NOW());

-- User Profile Update
UPDATE users SET full_name = ?, email = ?, phone_number = ?, profile_image_url = ? 
WHERE id = ?;

-- Password Reset
UPDATE users SET password_hash = ? WHERE id = ?;

-- User Activity Tracking
INSERT INTO user_sessions (user_id, session_token, ip_address, last_activity) 
VALUES (?, ?, ?, NOW());

-- Update Session Activity
UPDATE user_sessions SET last_activity = NOW(), current_page = ?, page_views = page_views + 1
WHERE session_token = ?;
```

### 2. Quiz Management

#### a. Class Diagram

![Quiz Class Diagram](quiz-class-diagram.png)

#### b. Class Specifications

Quiz Class:
Represents a quiz created by a lecturer or generated by AI.

| No | Method | Description |
|----|--------|-------------|
| 01 | getId() | Returns the unique identifier of the quiz |
| 02 | getTitle() | Returns the quiz title |
| 03 | getMaMon() | Returns the subject code associated with the quiz |
| 04 | getMaDe() | Returns the exam code for the quiz |
| 05 | getDescription() | Returns the quiz description |
| 06 | getTimeLimit() | Returns the time limit in minutes |
| 07 | getQuestions() | Returns the list of questions in this quiz |
| 08 | setId(Integer id) | Sets the quiz ID |
| 09 | setTitle(String title) | Sets the quiz title |
| 10 | setMaMon(String maMon) | Sets the subject code |
| 11 | setMaDe(String maDe) | Sets the exam code |
| 12 | setQuestions(List<Question> questions) | Sets the list of questions |

Question Class:
Represents an individual quiz question.

| No | Method | Description |
|----|--------|-------------|
| 01 | getId() | Returns the unique identifier of the question |
| 02 | getQuestionText() | Returns the text of the question |
| 03 | getCorrect() | Returns the correct answer identifier |
| 04 | getExplanation() | Returns the explanation for the correct answer |
| 05 | getPoints() | Returns the point value of this question |
| 06 | setId(Integer id) | Sets the question ID |
| 07 | setQuestionText(String text) | Sets the question text |
| 08 | setCorrect(String correct) | Sets the correct answer |
| 09 | setExplanation(String explanation) | Sets the explanation |

QuizService Class:
Provides business logic for quiz management.

| No | Method | Description |
|----|--------|-------------|
| 01 | createQuiz(Quiz quiz) | Creates a new quiz in the system |
| 02 | getQuizById(Integer id) | Retrieves a quiz by ID |
| 03 | getQuizzesByMaMon(String maMon) | Retrieves quizzes for a subject |
| 04 | startQuiz(Integer quizId, Integer userId) | Starts a quiz attempt for a user |
| 05 | submitQuiz(Integer quizTakenId, Map<Integer, String> answers) | Submits and scores a quiz attempt |
| 06 | createAIQuiz(Integer lessonId, Integer userId) | Generates a quiz from lesson content using AI |

#### c. Sequence Diagram

![Quiz Taking Sequence Diagram](quiz-sequence-diagram.png)

#### d. Database Queries

```sql
-- Create a new quiz
INSERT INTO Quizzes (title, MaMon, MaDe, description, user_id, is_ai_generated, password, time_limit, security_level) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);

-- Add questions to a quiz
INSERT INTO Questions (QuestionText, Correct, Explanation, quiz_id, MaDe, MaMon, points) 
VALUES (?, ?, ?, ?, ?, ?, ?);

-- Retrieve a quiz with its questions
SELECT q.*, COUNT(qu.ID) as question_count 
FROM Quizzes q 
LEFT JOIN Questions qu ON q.id = qu.quiz_id 
WHERE q.id = ? 
GROUP BY q.id;

-- Start a quiz attempt
INSERT INTO QuizTaken (user_id, quiz_id, start_time, status, ip_address, user_agent) 
VALUES (?, ?, NOW(), 'in_progress', ?, ?);

-- Submit a quiz attempt
UPDATE QuizTaken 
SET submit_time = NOW(), 
    score = ?, 
    max_score = ?, 
    percentage = ?, 
    status = ?, 
    selected_answers = ?, 
    completion_time = ? 
WHERE id = ?;

-- Get quiz attempts for a user
SELECT qt.*, q.title, q.MaMon, q.MaDe 
FROM QuizTaken qt 
JOIN Quizzes q ON qt.quiz_id = q.id 
WHERE qt.user_id = ? 
ORDER BY qt.start_time DESC;
```

### 3. Learning Resources

#### a. Class Diagram

```
   +-------------+      +--------------+
   |   Subject   |      |    Lesson    |
   +-------------+      +--------------+
   | -id: Integer|<---->| -id: Integer |
   | -name: String|     | -title: String|
   | -active: Bool|     | -content: Text|
   +-------------+      | -subjectId: Int|
                        | -lecturerId: Int|
                        | -date: Date   |
                        | -likes: Integer|
                        | -viewCount: Int|
                        +--------------+
```

#### b. Class Specifications

Subject Class:
Represents an academic subject.

| No | Method | Description |
|----|--------|-------------|
| 01 | getId() | Returns the unique identifier of the subject |
| 02 | getName() | Returns the subject name |
| 03 | isActive() | Returns whether the subject is active |
| 04 | setId(Integer id) | Sets the subject ID |
| 05 | setName(String name) | Sets the subject name |
| 06 | setActive(Boolean active) | Sets the subject active state |

Lesson Class:
Represents learning content for a subject.

| No | Method | Description |
|----|--------|-------------|
| 01 | getId() | Returns the unique identifier of the lesson |
| 02 | getTitle() | Returns the lesson title |
| 03 | getContent() | Returns the lesson content in markdown format |
| 04 | getSubjectId() | Returns the associated subject ID |
| 05 | getLecturerId() | Returns the ID of the lecturer who created it |
| 06 | getDate() | Returns the creation date |
| 07 | getLikes() | Returns the number of likes |
| 08 | getViewCount() | Returns the view count |
| 09 | setId(Integer id) | Sets the lesson ID |
| 10 | setTitle(String title) | Sets the lesson title |
| 11 | setContent(String content) | Sets the lesson content |
| 12 | setSubjectId(Integer subjectId) | Sets the subject association |

LessonService Class:
Provides business logic for learning resource management.

| No | Method | Description |
|----|--------|-------------|
| 01 | createLesson(Lesson lesson) | Creates a new lesson |
| 02 | getLessonById(Integer id) | Retrieves a lesson by ID |
| 03 | getLessonsBySubject(Integer subjectId) | Gets lessons for a subject |
| 04 | updateLesson(Integer id, Lesson lesson) | Updates an existing lesson |
| 05 | incrementViewCount(Integer lessonId) | Increases the view count |
| 06 | toggleLike(Integer lessonId, Integer userId) | Toggles a user's like on a lesson |

#### c. Sequence Diagram

```
View Lessons Flow:

Student -> Frontend: Select subject
Frontend -> LessonController: GET /api/lessons?subjectId=X
LessonController -> LessonDAO: getLessonsBySubject(subjectId)
LessonDAO -> Database: SELECT * FROM Lessons WHERE SubjectId = ?
Database -> LessonDAO: Lesson records
LessonDAO -> LessonController: List of Lesson objects
LessonController -> Frontend: JSON response with lessons
Frontend -> Student: Display lesson list

Create Lesson Flow:

Lecturer -> Frontend: Submit lesson form
Frontend -> LessonController: POST /api/lessons
LessonController -> LessonDAO: createLesson(lesson)
LessonDAO -> Database: INSERT INTO Lessons
Database -> LessonDAO: Success/ID
LessonDAO -> LessonController: Created lesson
LessonController -> Frontend: Success response
Frontend -> Lecturer: Confirmation message
```

#### d. Database Queries

```sql
-- Get all subjects
SELECT * FROM Subjects WHERE Active = 1;

-- Get lessons for a subject
SELECT l.*, u.full_name as lecturer_name, u.profile_image_url 
FROM Lessons l 
LEFT JOIN users u ON l.LecturerId = u.id 
WHERE l.SubjectId = ? 
ORDER BY l.Date DESC;

-- Create a new lesson
INSERT INTO Lessons (SubjectId, Title, Content, LecturerId, Date) 
VALUES (?, ?, ?, ?, NOW());

-- Update a lesson
UPDATE Lessons 
SET Title = ?, Content = ?, SubjectId = ? 
WHERE ID = ?;

-- Increment view count
UPDATE Lessons SET ViewCount = ViewCount + 1 WHERE ID = ?;

-- Add a like to a lesson
UPDATE Lessons SET Likes = Likes + 1 WHERE ID = ?;
```

### 4. Video Call System

#### a. Class Diagram

```
+------------------+      +-------------------+
| VideoCallContext |      | DirectWebRTCContext |
+------------------+      +-------------------+
| -user: Object    |      | -user: Object     |
| -stream: MediaStream |  | -stream: MediaStream |
| -callState: Object|      | -callState: Object |
| -error: String    |      | -peerConnection: RTCPeerConnection |
+------------------+      +-------------------+
| +startCall()      |      | +startCall()      |
| +answerCall()     |      | +answerCall()     |
| +endCall()        |      | +endCall()        |
| +toggleMute()     |      | +toggleVideo()    |
+------------------+      +-------------------+
```

#### b. Class Specifications

VideoCallContext:
Provides context and methods for WebRTC video calls using simple-peer.

| No | Method | Description |
|----|--------|-------------|
| 01 | startCall(receiverId, receiverName) | Initiates a video call to another user |
| 02 | answerCall(callerId, callerName, signal) | Accepts an incoming call and establishes connection |
| 03 | endCall() | Terminates the current call and cleans up resources |
| 04 | toggleMute() | Toggles the microphone mute state |
| 05 | toggleVideo() | Toggles the camera on/off state |
| 06 | startSignalPolling(userId) | Polls for incoming WebRTC signals |
| 07 | getCallState() | Returns the current state of any active call |

DirectWebRTCContext:
Provides alternative implementation using native WebRTC APIs.

| No | Method | Description |
|----|--------|-------------|
| 01 | startCall(receiverId, receiverName) | Initiates a video call using RTCPeerConnection |
| 02 | answerCall(callerId, callerName, offer) | Accepts an incoming call by creating an answer |
| 03 | endCall() | Terminates the RTCPeerConnection and cleans up |
| 04 | setupPeerConnectionHandlers(pc, stream) | Sets up event handlers for RTCPeerConnection |
| 05 | handleIceCandidate(candidate, receiverId) | Processes and sends ICE candidates |
| 06 | addIceCandidate(candidate) | Adds received ICE candidates to the connection |

#### c. Sequence Diagram

![Video Call Sequence Diagram](videocall-sequence-diagram.png)

#### d. WebRTC Implementation

The video call feature is implemented using WebRTC technology with two approaches:

1. Simple-peer library:
   - Higher-level abstraction for easier implementation
   - Automatic handling of signaling and ICE candidates
   - Used in the VideoCallContext implementation

2. Native WebRTC API:
   - Direct use of browser's RTCPeerConnection API
   - More control over the connection process
   - Used in the DirectWebRTCContext implementation

Both implementations use a polling-based signaling mechanism where:
- Offers, answers, and ICE candidates are exchanged via REST endpoints
- Clients poll for incoming signals at regular intervals
- STUN and TURN servers are configured for NAT traversal
- Media tracks are managed for camera and microphone access

Key WebRTC configuration:
```javascript
{
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', ...] },
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp'
      ],
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10
}
