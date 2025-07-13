# Google OAuth Setup Guide

## Backend Configuration

### 1. Add Google OAuth Dependencies
The following dependencies have been added to `pom.xml`:
- google-api-client
- google-oauth-client
- google-oauth-client-jetty
- google-api-services-oauth2
- jjwt-api, jjwt-impl, jjwt-jackson

### 2. Environment Variables
Add the following environment variables to your backend:

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

### 3. Database Migration
Run the migration to add Google OAuth fields:
```sql
-- Add Google OAuth fields to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN profile_image_url VARCHAR(500) DEFAULT NULL;

-- Add index for Google ID lookup
CREATE INDEX idx_users_google_id ON users(google_id);
```

## Frontend Configuration

### 1. Install Google OAuth Library
```bash
cd frontend
npm install @react-oauth/google
```

### 2. Environment Variables
Create a `.env` file in the frontend directory:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Configuration
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_OPEN_URL=http://localhost:8080/open
REACT_APP_EMERGENCY_URL=http://localhost:8080/emergency
```

## Google Cloud Console Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API

### 2. Configure OAuth 2.0
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen
4. Set application type to "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:8080`
6. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/auth/google/callback`

### 3. Get Client ID and Secret
Copy the Client ID and Client Secret from the Google Cloud Console.

## Features Implemented

### Backend Features
✅ **Google OAuth Service**: Xử lý đăng nhập bằng Google
✅ **Token Verification**: Xác thực Google ID token
✅ **User Management**: 
- Tìm user theo email
- Tạo user mới từ Google
- Liên kết tài khoản hiện tại với Google
✅ **JWT Token Generation**: Tạo JWT token cho user
✅ **Database Schema**: Thêm trường Google ID và profile image

### Frontend Features
✅ **Google OAuth Provider**: Cấu hình Google OAuth trong App.js
✅ **Login Integration**: Thêm nút Google OAuth vào trang Login
✅ **AuthContext Integration**: Thêm googleLogin function
✅ **Error Handling**: Xử lý lỗi Google OAuth
✅ **Navigation**: Chuyển hướng dựa trên role sau đăng nhập

## Authentication Flow

### 1. User clicks "Continue with Google"
- Google OAuth popup opens
- User authenticates with Google

### 2. Google returns ID token
- Frontend receives Google response
- Sends token to backend

### 3. Backend processes user
- Verifies Google ID token
- Checks if email exists:
  - **If exists with local auth**: Links account to Google
  - **If exists with Google auth**: Returns current user
  - **If doesn't exist**: Creates new user with Google info

### 4. User is logged in and redirected
- Backend returns JWT token and user info
- Frontend stores user data and token
- User is redirected based on role

## API Endpoints

### POST /api/auth/google/login
Handles Google OAuth login

**Request Body:**
```json
{
  "idToken": "google-id-token",
  "accessToken": "google-access-token",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://profile-image-url"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "user",
    "fullName": "User Name",
    "role": "student",
    "verified": true,
    "isNewUser": false,
    "linkedToGoogle": true
  }
}
```

### GET /api/auth/google/check-email?email=user@example.com
Checks if email is registered

**Response:**
```json
{
  "exists": true,
  "hasLocalAuth": true,
  "verified": true
}
```

## Security Features

✅ **Token Verification**: Verifies Google ID tokens
✅ **JWT Tokens**: Secure session management
✅ **CORS Configuration**: Proper CORS setup
✅ **Error Handling**: Comprehensive error handling
✅ **Input Validation**: Validates all inputs

## Testing

### Test Cases
1. **New User Registration**: User signs up with Google for the first time
2. **Existing Google User**: User who previously signed up with Google
3. **Account Linking**: User with local account links to Google
4. **Error Handling**: Invalid tokens, network errors
5. **Role-based Navigation**: Different redirects for different roles

### Test Commands
```bash
# Backend
mvn clean install
mvn spring-boot:run

# Frontend
cd frontend
npm start
```

## Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure CORS is properly configured
2. **Invalid Client ID**: Check Google Cloud Console configuration
3. **Token Verification Failed**: Verify Google Client ID and Secret
4. **Database Errors**: Run migration scripts

### Debug Steps
1. Check browser console for frontend errors
2. Check backend logs for server errors
3. Verify environment variables are set correctly
4. Test Google OAuth configuration in Google Cloud Console 