# Email Verification System

This document describes the email verification system implemented for the Amazon Clone application.

## Overview

The email verification system ensures that users provide valid email addresses during registration and prevents unauthorized account creation. Users must verify their email addresses before they can log in to the application.

## Features

### 1. User Registration with Email Verification
- When a user registers, a verification token is generated
- A verification email is sent to the user's email address
- The user account is created but marked as unverified
- Users cannot log in until their email is verified

### 2. Email Verification Process
- Users receive an email with a verification link
- The link contains a secure token that expires after 24 hours
- Clicking the link verifies the email address
- After verification, users can log in normally

### 3. Resend Verification Email
- Users can request a new verification email if the original expires
- A new token is generated and sent
- Previous tokens are invalidated

### 4. Admin Management
- Admins can view verified and unverified users
- Admins can manually verify user emails
- Admin endpoints require proper authentication and authorization

## Database Schema Changes

### New Columns in `users` Table
- `email_verified` (BOOLEAN): Indicates if the email has been verified
- `verification_token` (VARCHAR(512)): Secure token for email verification
- `verification_token_expiry` (TIMESTAMP): Expiration time for the verification token

## Configuration

### Email Settings (application.properties)
```properties
# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application Configuration
app.base-url=${APP_BASE_URL:http://localhost:3000}
app.email.from=${EMAIL_FROM:no-reply@amazonclone.com}
```

### Environment Variables Required
- `EMAIL_USERNAME`: Gmail account username
- `EMAIL_PASSWORD`: Gmail app password (not regular password)
- `APP_BASE_URL`: Frontend application URL
- `EMAIL_FROM`: From email address

## API Endpoints

### Public Endpoints

#### 1. Email Verification
```
GET /api/auth/verify-email?token={verification_token}
```
- Verifies user email using the provided token
- Returns success message or error details

#### 2. Resend Verification Email
```
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```
- Sends a new verification email to the specified address
- Returns success message or error details

### Admin Endpoints (Require Admin Role)

#### 1. Get Verified Users
```
GET /admin/users/verified
Authorization: Bearer {jwt_token}
```
- Returns list of all users with verified emails

#### 2. Get Unverified Users
```
GET /admin/users/unverified
Authorization: Bearer {jwt_token}
```
- Returns list of all users with unverified emails

#### 3. Manually Verify User Email
```
POST /admin/users/{userId}/verify-email
Authorization: Bearer {jwt_token}
```
- Manually verifies a user's email address
- Useful for admin intervention

## Security Features

### 1. Secure Token Generation
- Uses `SecureRandom` for cryptographically secure tokens
- Tokens are Base64 URL-safe encoded
- 32-byte random tokens provide high entropy

### 2. Token Expiration
- Verification tokens expire after 24 hours
- Expired tokens cannot be used for verification
- Users must request new tokens if expired

### 3. Email Validation
- Users cannot log in without email verification
- Prevents unauthorized account access
- Maintains data integrity

## Implementation Details

### Services

#### EmailService
- Handles sending verification emails
- Uses Spring Boot Mail Starter
- Configurable email templates

#### VerificationTokenService
- Generates secure verification tokens
- Manages token expiration times
- Validates token expiration

#### UserService Updates
- Modified `createUser()` to generate verification tokens
- Updated `authenticateUser()` to check email verification
- Added email verification methods

### Error Handling
- Graceful handling of email sending failures
- Clear error messages for users
- Proper exception handling throughout the system

## Setup Instructions

### 1. Configure Email Settings
1. Create a Gmail account or use existing one
2. Enable 2-factor authentication
3. Generate an App Password
4. Set environment variables:
   ```bash
   export EMAIL_USERNAME="your-email@gmail.com"
   export EMAIL_PASSWORD="your-app-password"
   export APP_BASE_URL="http://localhost:3000"
   export EMAIL_FROM="no-reply@amazonclone.com"
   ```

### 2. Database Migration
The system includes a migration script that adds the required columns:
```sql
-- V2__add_email_verification.sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN verification_token VARCHAR(512);
ALTER TABLE users ADD COLUMN verification_token_expiry TIMESTAMP;
```

### 3. Frontend Integration
The frontend should:
1. Handle the verification link redirect
2. Display appropriate messages for verification status
3. Provide option to resend verification email
4. Show verification status in user profile

## Testing

### Manual Testing
1. Register a new user
2. Check email for verification link
3. Click verification link
4. Attempt to log in (should succeed)
5. Test with expired token
6. Test resend verification functionality

### Admin Testing
1. Login as admin
2. Access admin endpoints
3. View verified/unverified users
4. Manually verify user emails

## Troubleshooting

### Common Issues

#### 1. Email Not Sending
- Check email configuration
- Verify Gmail app password
- Check firewall/network settings
- Review application logs

#### 2. Token Expiration
- Tokens expire after 24 hours
- Users must request new verification email
- Check system clock synchronization

#### 3. Database Issues
- Ensure migration script ran successfully
- Check database connection
- Verify column names and types

## Future Enhancements

### Potential Improvements
1. HTML email templates with branding
2. Multiple email providers support
3. Email verification analytics
4. Rate limiting for verification requests
5. Integration with email validation services
6. Bulk email verification for admins 