# Milestone 2 Manual Testing Instructions

## Overview
This document provides step-by-step instructions for manually testing the Authentication & Authorization implementation in Milestone 2.

## Prerequisites
1. PostgreSQL database installed and running
2. Node.js 18+ installed
3. npm installed
4. Dependencies installed: `npm install`
5. Database configured in `backend/.env`
6. Database migrations run: `npm run db:migrate`
7. Backend server running: `npm run dev:backend`
8. Frontend server running: `npm run dev:frontend`

## Test Environment Setup

### 1. Database Setup
```bash
# Create database (if not exists)
createdb intelligent_assessment

# Run migrations
cd backend
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 2. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 3. Verify Server Health
```bash
# Test backend health endpoint
curl http://localhost:3001/health

# Expected response:
# {"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Test Cases

### Test Suite 1: User Registration

#### TC-REG-001: Valid Registration
**Objective**: Verify that a new user can register with valid information

**Preconditions**:
- Backend server is running
- Database is accessible
- User with email `student@test.com` does not exist

**Steps**:
1. Open browser to `http://localhost:5173/register`
2. Enter first name: `Test`
3. Enter last name: `Student`
4. Enter email: `student@test.com`
5. Enter password: `TestPass123`
6. Enter confirm password: `TestPass123`
7. Click "Register" button

**Expected Result**:
- Success message appears: "Registration successful. Please login to continue."
- Form is cleared
- No error messages
- Database contains new user record with role `STUDENT`

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-REG-002: Duplicate Email Registration
**Objective**: Verify that duplicate email registration is rejected

**Preconditions**:
- User with email `student@test.com` exists from TC-REG-001

**Steps**:
1. Open browser to `http://localhost:5173/register`
2. Enter first name: `Another`
3. Enter last name: `Student`
4. Enter email: `student@test.com`
5. Enter password: `TestPass123`
6. Enter confirm password: `TestPass123`
7. Click "Register" button

**Expected Result**:
- Error message appears: "Email already registered"
- User is not created in database
- HTTP 409 status code in network tab

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-REG-003: Invalid Email Format
**Objective**: Verify that invalid email format is rejected

**Steps**:
1. Open browser to `http://localhost:5173/register`
2. Enter email: `invalid-email`
3. Fill other required fields
4. Click "Register" button

**Expected Result**:
- Validation error: "Invalid email format"
- Form submission is blocked

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-REG-004: Weak Password
**Objective**: Verify that weak passwords are rejected

**Steps**:
1. Open browser to `http://localhost:5173/register`
2. Enter password: `weak`
3. Fill other required fields
4. Click "Register" button

**Expected Result**:
- Validation error: "Password must be at least 8 characters..."
- Form submission is blocked

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-REG-005: Password Mismatch
**Objective**: Verify that password mismatch is detected

**Steps**:
1. Open browser to `http://localhost:5173/register`
2. Enter password: `TestPass123`
3. Enter confirm password: `DifferentPass123`
4. Fill other required fields
5. Click "Register" button

**Expected Result**:
- Error: "Passwords do not match"
- Form submission is blocked

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-REG-006: Missing Required Fields
**Objective**: Verify that missing required fields are rejected

**Steps**:
1. Open browser to `http://localhost:5173/register`
2. Leave first name empty
3. Fill other fields
4. Click "Register" button

**Expected Result**:
- Validation error: "First name is required"
- Form submission is blocked

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

### Test Suite 2: User Login

#### TC-LOG-001: Valid Login
**Objective**: Verify that user can login with valid credentials

**Preconditions**:
- User with email `student@test.com` exists

**Steps**:
1. Open browser to `http://localhost:5173/login`
2. Enter email: `student@test.com`
3. Enter password: `TestPass123`
4. Click "Sign In" button

**Expected Result**:
- User is redirected to `/dashboard`
- Dashboard shows user information
- Token is stored in localStorage
- No error messages

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-LOG-002: Invalid Email
**Objective**: Verify that login fails with non-existent email

**Steps**:
1. Open browser to `http://localhost:5173/login`
2. Enter email: `nonexistent@test.com`
3. Enter password: `TestPass123`
4. Click "Sign In" button

**Expected Result**:
- Error message: "Invalid credentials"
- User is not logged in
- HTTP 401 status code

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-LOG-003: Invalid Password
**Objective**: Verify that login fails with incorrect password

**Preconditions**:
- User with email `student@test.com` exists

**Steps**:
1. Open browser to `http://localhost:5173/login`
2. Enter email: `student@test.com`
3. Enter password: `WrongPassword123`
4. Click "Sign In" button

**Expected Result**:
- Error message: "Invalid credentials"
- User is not logged in
- HTTP 401 status code

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-LOG-004: Missing Credentials
**Objective**: Verify that login fails with missing fields

**Steps**:
1. Open browser to `http://localhost:5173/login`
2. Leave password empty
3. Click "Sign In" button

**Expected Result**:
- Validation error
- Form submission is blocked

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

### Test Suite 3: Session Management

#### TC-SES-001: Token Storage
**Objective**: Verify that JWT token is stored correctly

**Preconditions**:
- User is logged in

**Steps**:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Check Local Storage
4. Look for `authToken` key

**Expected Result**:
- `authToken` exists in localStorage
- Token is a non-empty string
- Token is not stored in cookies (current implementation)

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-SES-002: Session Persistence
**Objective**: Verify that session persists after page refresh

**Preconditions**:
- User is logged in

**Steps**:
1. User is on dashboard
2. Refresh the page (F5 or Ctrl+R)
3. Observe user state

**Expected Result**:
- User remains logged in
- Dashboard still displays user information
- User is not redirected to login

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-SES-003: Logout
**Objective**: Verify that logout works correctly

**Preconditions**:
- User is logged in

**Steps**:
1. Navigate to dashboard
2. Click "Logout" button
3. Observe navigation and localStorage

**Expected Result**:
- User is redirected to `/login`
- `authToken` is removed from localStorage
- User can no longer access protected routes

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-SES-004: Protected Route Access After Logout
**Objective**: Verify that protected routes are inaccessible after logout

**Preconditions**:
- User is logged out

**Steps**:
1. Try to navigate to `http://localhost:5173/dashboard`
2. Observe behavior

**Expected Result**:
- User is redirected to `/login`
- Dashboard is not displayed
- Redirect preserves intended destination

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

### Test Suite 4: Password Management

#### TC-PWD-001: Valid Password Change
**Objective**: Verify that password can be changed with valid current password

**Preconditions**:
- User is logged in

**Steps**:
1. Navigate to `/change-password`
2. Enter current password: `TestPass123`
3. Enter new password: `NewTestPass123`
4. Enter confirm new password: `NewTestPass123`
5. Click "Change Password" button

**Expected Result**:
- Success message: "Password changed successfully"
- Form is cleared
- User can login with new password
- Old password no longer works

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-PWD-002: Invalid Current Password
**Objective**: Verify that password change fails with incorrect current password

**Steps**:
1. Navigate to `/change-password`
2. Enter current password: `WrongPassword`
3. Enter new password: `NewTestPass123`
4. Click "Change Password" button

**Expected Result**:
- Error: "Current password is incorrect"
- Password is not changed
- HTTP 401 status code

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence**: ___________________

---

#### TC-PWD-003: Weak New Password
**Objective**: Verify that weak new password is rejected

**Steps**:
1. Navigate to `/change-password`
2. Enter current password: `TestPass123`
3. Enter new password: `weak`
4. Click "Change Password" button

**Expected Result**:
- Validation error about password strength
- Password is not changed

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

### Test Suite 5: Authorization

#### TC-AUTH-001: Protected Route Access
**Objective**: Verify that protected routes require authentication

**Steps**:
1. Logout if logged in
2. Clear localStorage
3. Navigate to `http://localhost:5173/dashboard`

**Expected Result**:
- Redirected to `/login`
- Dashboard not accessible

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

#### TC-AUTH-002: API Authentication
**Objective**: Verify that API endpoints require authentication

**Steps**:
1. Open browser DevTools
2. Go to Console tab
3. Execute:
```javascript
fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Content-Type': 'application/json'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Result**:
- Response contains error type `AUTHENTICATION_ERROR`
- HTTP 401 status code

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

#### TC-AUTH-003: API with Valid Token
**Objective**: Verify that API endpoints work with valid token

**Preconditions**:
- User is logged in and has valid token

**Steps**:
1. Open browser DevTools
2. Go to Console tab
3. Get token from localStorage
4. Execute:
```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}).then(r => r.json()).then(console.log)
```

**Expected Result**:
- Response contains user data
- HTTP 200 status code
- No password in response

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

### Test Suite 6: Security

#### TC-SEC-001: Password Hashing
**Objective**: Verify that passwords are stored as hashes

**Steps**:
1. Connect to database using Prisma Studio or psql
2. Query users table
3. Check password field for test user

**Expected Result**:
- Password is not plaintext
- Password is a bcrypt hash (starts with $2b$)
- Original password cannot be determined from hash

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

#### TC-SEC-002: No Password in Response
**Objective**: Verify that password is never exposed in API responses

**Steps**:
1. Login via API
2. Check response body
3. Call `/api/v1/auth/me`
4. Check response body

**Expected Result**:
- No password field in any response
- No password hash in any response

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

#### TC-SEC-003: Token Validation
**Objective**: Verify that invalid tokens are rejected

**Steps**:
1. Open browser DevTools
2. Go to Console tab
3. Execute:
```javascript
fetch('http://localhost:3001/api/v1/auth/me', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer invalid-token-12345'
  }
}).then(r => r.json()).then(console.log)
```

**Expected Result**:
- Error: "Invalid or expired token"
- HTTP 401 status code

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

#### TC-SEC-004: Role Assignment
**Objective**: Verify that public registration cannot create privileged accounts

**Steps**:
1. Register a new user via `/register`
2. Check user role in database
3. Try to register with role field (if possible via API)

**Expected Result**:
- New user has role `STUDENT`
- No way to specify role during registration
- Cannot register as TEACHER or ADMIN via public endpoint

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

### Test Suite 7: Database Integrity

#### TC-DB-001: Unique Email Constraint
**Objective**: Verify database enforces unique email

**Steps**:
1. Try to create user with duplicate email via direct database query or API
2. Check database response

**Expected Result**:
- Database rejects duplicate email
- Unique constraint error
- Only one user with given email exists

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

#### TC-DB-002: Schema Validation
**Objective**: Verify schema constraints are enforced

**Steps**:
1. Check Prisma schema
2. Verify required fields are marked as required
3. Verify email has @unique constraint
4. Verify role has default value

**Expected Result**:
- All required fields marked in schema
- Email has @unique
- Role has @default(STUDENT)
- Password field exists

**Actual Result**: ___________________
**Status**: PASS / FAIL
**Evidence`: ___________________

---

## Test Execution Summary

| Test Suite | Total Tests | Passed | Failed | Blocked |
|------------|-------------|--------|--------|---------|
| Registration | 6 | ____ | ____ | ____ |
| Login | 4 | ____ | ____ | ____ |
| Session Management | 4 | ____ | ____ | ____ |
| Password Management | 3 | ____ | ____ | ____ |
| Authorization | 3 | ____ | ____ | ____ |
| Security | 4 | ____ | ____ | ____ |
| Database Integrity | 2 | ____ | ____ | ____ |
| **TOTAL** | **26** | **____** | **____** | **____** |

## Known Issues

Document any issues discovered during testing:

1. ___________________
2. ___________________
3. ___________________

## Notes

- All test data should use synthetic/test accounts
- Never use real user passwords
- Clean up test data after testing
- Report any security issues immediately

---

**Test Execution Date**: ___________________
**Tested By**: ___________________
**Environment**: Development / Staging / Production
**Browser**: ___________________
**OS**: ___________________
