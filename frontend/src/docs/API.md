# FStudyMate API Documentation

This document provides detailed information about the API endpoints available in the FStudyMate application.

## Base URL

For local development: `https://localhost:8443/api`

## Authentication

### Login

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "student",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

**Status Codes**:
- `200 OK`: Login successful
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account locked or disabled

### Register

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "student"
}
```

**Response**:
```json
{
  "message": "Registration successful. Please verify your email.",
  "userId": 1
}
```

**Status Codes**:
- `201 Created`: Registration successful
- `400 Bad Request`: Invalid input or email already exists

### Verify OTP

**Endpoint**: `POST /auth/verify-otp`

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response**:
```json
{
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes**:
- `200 OK`: Verification successful
- `400 Bad Request`: Invalid OTP
- `410 Gone`: OTP expired

### Logout

**Endpoint**: `POST /auth/logout`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

**Status Codes**:
- `200 OK`: Logout successful
- `401 Unauthorized`: Invalid or expired token

## User Management

### Get Current User

**Endpoint**: `GET /users/me`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "student",
  "avatar": "https://example.com/avatar.jpg",
  "createdAt": "2023-01-01T00:00:00Z",
  "lastLogin": "2023-01-10T00:00:00Z",
  "settings": {
    "darkMode": true,
    "notifications": true
  }
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token

### Update User Profile

**Endpoint**: `PUT /users/me`

**Headers**:
- `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "name": "John Doe Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response**:
```json
{
  "id": 1,
  "name": "John Doe Updated",
  "email": "user@example.com",
  "avatar": "https://example.com/new-avatar.jpg",
  "updatedAt": "2023-01-15T00:00:00Z"
}
```

**Status Codes**:
- `200 OK`: Update successful
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid or expired token

### Change Password

**Endpoint**: `PUT /users/change-password`

**Headers**:
- `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123"
}
```

**Response**:
```json
{
  "message": "Password changed successfully"
}
```

**Status Codes**:
- `200 OK`: Password change successful
- `400 Bad Request`: Invalid password format
- `401 Unauthorized`: Current password incorrect

### List Users (Admin Only)

**Endpoint**: `GET /admin/users`

**Headers**:
- `Authorization: Bearer {token}`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response**:
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "createdAt": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "lecturer",
      "createdAt": "2023-01-02T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "pages": 3,
    "current": 1,
    "limit": 20
  }
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Not an admin user

## Quizzes

### List Available Quizzes

**Endpoint**: `GET /quizzes`

**Headers**:
- `Authorization: Bearer {token}`

**Query Parameters**:
- `subject` (optional): Filter by subject code
- `type` (optional): Filter by quiz type (multiple_choice, coding, etc.)

**Response**:
```json
{
  "quizzes": [
    {
      "id": 1,
      "title": "Java Basics Quiz",
      "subject": "PRO192",
      "type": "multiple_choice",
      "duration": 30,
      "questionCount": 20,
      "createdBy": "Lecturer Name",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token

### Get Quiz Details

**Endpoint**: `GET /quizzes/{quizId}`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "id": 1,
  "title": "Java Basics Quiz",
  "subject": "PRO192",
  "type": "multiple_choice",
  "description": "This quiz covers Java basics including syntax, OOP concepts, and exceptions.",
  "duration": 30,
  "totalMarks": 100,
  "passingMarks": 50,
  "randomizeQuestions": true,
  "createdBy": {
    "id": 3,
    "name": "Lecturer Name"
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-05T00:00:00Z"
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Quiz not found

### Start Quiz

**Endpoint**: `POST /quizzes/{quizId}/start`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "attemptId": 123,
  "quizId": 1,
  "startTime": "2023-01-15T10:00:00Z",
  "endTime": "2023-01-15T10:30:00Z",
  "questions": [
    {
      "id": 101,
      "question": "What is the Java keyword used to define a class?",
      "type": "multiple_choice",
      "options": [
        {"id": 1, "text": "class"},
        {"id": 2, "text": "struct"},
        {"id": 3, "text": "define"},
        {"id": 4, "text": "object"}
      ],
      "marks": 5
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Quiz started successfully
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Not allowed to take this quiz
- `404 Not Found`: Quiz not found

### Submit Quiz

**Endpoint**: `POST /quizzes/attempts/{attemptId}/submit`

**Headers**:
- `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "answers": [
    {
      "questionId": 101,
      "selectedOptionId": 1
    },
    {
      "questionId": 102,
      "selectedOptionId": 3
    }
  ]
}
```

**Response**:
```json
{
  "attemptId": 123,
  "score": 85,
  "totalMarks": 100,
  "passingMarks": 50,
  "timeTaken": "00:25:30",
  "submittedAt": "2023-01-15T10:25:30Z",
  "result": "PASSED"
}
```

**Status Codes**:
- `200 OK`: Quiz submitted successfully
- `400 Bad Request`: Invalid submission format
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Attempt not found
- `410 Gone`: Attempt expired

### Lecturer: Create Quiz

**Endpoint**: `POST /lecturer/quizzes`

**Headers**:
- `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "title": "Java Basics Quiz",
  "subject": "PRO192",
  "type": "multiple_choice",
  "description": "This quiz covers Java basics including syntax, OOP concepts, and exceptions.",
  "duration": 30,
  "totalMarks": 100,
  "passingMarks": 50,
  "randomizeQuestions": true,
  "questions": [
    {
      "question": "What is the Java keyword used to define a class?",
      "type": "multiple_choice",
      "marks": 5,
      "options": [
        {"text": "class", "isCorrect": true},
        {"text": "struct", "isCorrect": false},
        {"text": "define", "isCorrect": false},
        {"text": "object", "isCorrect": false}
      ]
    }
  ]
}
```

**Response**:
```json
{
  "id": 1,
  "title": "Java Basics Quiz",
  "createdAt": "2023-01-15T00:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Quiz created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Not a lecturer

### Lecturer: Get Quiz Attempts

**Endpoint**: `GET /lecturer/quizzes/{quizId}/attempts`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "attempts": [
    {
      "id": 123,
      "student": {
        "id": 1,
        "name": "John Doe"
      },
      "score": 85,
      "totalMarks": 100,
      "submittedAt": "2023-01-15T10:25:30Z",
      "result": "PASSED"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Not a lecturer
- `404 Not Found`: Quiz not found

## Learning Resources

### List Subjects

**Endpoint**: `GET /subjects`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "subjects": [
    {
      "code": "PRO192",
      "name": "Object-Oriented Programming",
      "semester": 2,
      "credits": 3,
      "materials": 12
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token

### Get Subject Materials

**Endpoint**: `GET /subjects/{subjectCode}/materials`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "subject": {
    "code": "PRO192",
    "name": "Object-Oriented Programming"
  },
  "materials": [
    {
      "id": 1,
      "title": "Java Classes and Objects",
      "type": "document",
      "fileUrl": "https://example.com/materials/java-classes.pdf",
      "uploadedBy": "Lecturer Name",
      "uploadedAt": "2023-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "title": "OOP Principles Video",
      "type": "video",
      "fileUrl": "https://example.com/materials/oop-video.mp4",
      "uploadedBy": "Lecturer Name",
      "uploadedAt": "2023-01-02T00:00:00Z"
    }
  ]
}
```

**Status Codes**:
- `200 OK`: Request successful
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Subject not found

### Lecturer: Upload Material

**Endpoint**: `POST /lecturer/subjects/{subjectCode}/materials`

**Headers**:
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data**:
- `title`: Material title
- `description`: Material description
- `type`: Material type (document, video, slide, etc.)
- `file`: File to upload

**Response**:
```json
{
  "id": 3,
  "title": "Inheritance in Java",
  "type": "document",
  "fileUrl": "https://example.com/materials/inheritance.pdf",
  "uploadedAt": "2023-01-15T00:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Material uploaded successfully
- `400 Bad Request`: Invalid input or file
- `401 Unauthorized`: Invalid or expired token
- `403 Forbidden`: Not a lecturer
- `404 Not Found`: Subject not found

## Video Calls

### Initiate Call

**Endpoint**: `POST /calls/initiate`

**Headers**:
- `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "targetUserId": 2,
  "callType": "video"
}
```

**Response**:
```json
{
  "callId": "abc123",
  "initiator": {
    "id": 1,
    "name": "John Doe"
  },
  "target": {
    "id": 2,
    "name": "Jane Smith"
  },
  "callType": "video",
  "initiatedAt": "2023-01-15T10:00:00Z"
}
```

**Status Codes**:
- `201 Created`: Call initiated successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Target user not found

### Answer Call

**Endpoint**: `POST /calls/{callId}/answer`

**Headers**:
- `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "answer": "accept",
  "signal": "..." // WebRTC signal data
}
```

**Response**:
```json
{
  "callId": "abc123",
  "status": "connected",
  "connectedAt": "2023-01-15T10:01:00Z"
}
```

**Status Codes**:
- `200 OK`: Call answered successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Call not found

### End Call

**Endpoint**: `POST /calls/{callId}/end`

**Headers**:
- `Authorization: Bearer {token}`

**Response**:
```json
{
  "callId": "abc123",
  "status": "ended",
  "duration": "00:05:30",
  "endedAt": "2023-01-15T10:05:30Z"
}
```

**Status Codes**:
- `200 OK`: Call ended successfully
- `401 Unauthorized`: Invalid or expired token
- `404 Not Found`: Call not found

## Error Responses

All API errors follow this standard format:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication token is invalid or expired",
    "details": "JWT signature does not match locally computed signature"
  },
  "timestamp": "2023-01-15T10:00:00Z",
  "path": "/api/users/me"
}
```

Common error codes:
- `BAD_REQUEST`: Invalid input data
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:

- Authentication endpoints: 10 requests per minute
- Standard endpoints: 60 requests per minute
- Admin endpoints: 30 requests per minute

When a rate limit is exceeded, the API will respond with:

**Status Code**: `429 Too Many Requests`

**Response**:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 seconds."
  },
  "timestamp": "2023-01-15T10:00:00Z"
}
```

The response includes the following headers:
- `X-RateLimit-Limit`: Total requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining in the current window
- `X-RateLimit-Reset`: Time (in seconds) until the rate limit resets 