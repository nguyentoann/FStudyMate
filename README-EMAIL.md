# Email Verification and Notification System

This document describes the email verification and notification features implemented in the application.

## Features

1. **OTP Verification for Registration**
   - One-time password sent to user email during registration
   - 6-digit numeric code with 10-minute expiry
   - Required to verify account before first login

2. **Email Notifications**
   - System can send email notifications to users
   - Supports both plain text and HTML formatted emails
   - Used for important updates, announcements, and account activity

## Configuration

To configure the email system, you need to update the `application.properties` file with your SMTP server details:

```properties
# Email configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### Gmail App Password

If you're using Gmail, you'll need to generate an app password:
1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification > App passwords
3. Select "Mail" as app and your device
4. Use the generated password in your configuration

## API Endpoints

### OTP Verification

- `POST /api/auth/verify-otp` - Verify OTP code
  - Request: `{ "email": "user@example.com", "otp": "123456" }`
  - Response: `{ "message": "Account verified successfully", "verified": true }`

- `POST /api/auth/resend-otp` - Resend OTP code
  - Request: `{ "email": "user@example.com" }`
  - Response: `{ "message": "New verification code sent to your email" }`

### Notifications

- `POST /api/notifications/send` - Send notification to user
  - Request: `{ "userId": 1, "subject": "Welcome", "message": "Welcome to our platform!" }`
  - Response: `{ "success": true, "message": "Notification sent successfully" }`

- `POST /api/notifications/send-by-email` - Send notification by email
  - Request: `{ "email": "user@example.com", "subject": "Welcome", "message": "Welcome to our platform!" }`
  - Response: `{ "success": true, "message": "Notification sent successfully" }` 