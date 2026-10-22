# API Architecture Documentation

## Overview

This document defines the API architecture and conventions for the Intelligent Assessment System. All APIs must follow these standards to ensure consistency across the application.

## Implementation Status (2026-10-17)

The currently mounted API includes `GET /health`, authentication routes, and the user routes listed below. Subject, assessment, assignment, AI, review, and analytics routes later in this document are planned design only; they are not implemented or reachable. Swagger/OpenAPI is not configured.

| Method | Path | Access | Status |
|---|---|---|---|
| GET | `/health` | Public liveness check; does not check PostgreSQL | Implemented |
| POST | `/api/v1/auth/register` | Public; role is always STUDENT | Implemented |
| POST | `/api/v1/auth/login` | Public | Implemented |
| POST | `/api/v1/auth/logout` | Authenticated; client-side token removal only | Implemented |
| GET | `/api/v1/auth/me` | Authenticated | Implemented |
| PUT | `/api/v1/users/profile` | Authenticated; updates own profile | Implemented |
| PUT | `/api/v1/users/password` | Authenticated; changes own password | Implemented |
| GET | `/api/v1/users/:id` | Own profile; teachers may read student profiles; admins may read all | Implemented |

## API Versioning

- **Version Strategy**: URL-based versioning
- **Current Version**: v1
- **Base URL**: `/api/v1`
- **Example**: `http://localhost:3001/api/v1/auth/login`

### Versioning Rules
- Breaking changes require a new version (v2, v3, etc.)
- Non-breaking changes (additions) can be made to the current version
- Old versions are maintained for at least one major version cycle

## Resource Naming Conventions

### URL Structure
- Use nouns, not verbs
- Use plural nouns for collections
- Use kebab-case for multi-word resources
- Hierarchical relationships should be reflected in the URL

### Examples
```
GET    /api/v1/users              # List all users
GET    /api/v1/users/{id}        # Get specific user
POST   /api/v1/users              # Create new user
PUT    /api/v1/users/{id}        # Update user (full)
PATCH  /api/v1/users/{id}        # Update user (partial)
DELETE /api/v1/users/{id}        # Delete user

GET    /api/v1/subjects/{id}/topics          # Get topics for a subject
POST   /api/v1/subjects/{id}/topics          # Create topic in subject
GET    /api/v1/assessments/{id}/attempts     # Get attempts for an assessment
```

## HTTP Method Conventions

| Method | Usage | Idempotent | Safe |
|--------|-------|------------|------|
| GET    | Retrieve resources | Yes | Yes |
| POST   | Create resources | No | No |
| PUT    | Replace entire resource | Yes | No |
| PATCH  | Partial update | No | No |
| DELETE | Delete resource | Yes | No |

## Request Structure

### Headers
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

### Request Body
- JSON format
- Use camelCase for property names
- Include only required fields for POST
- Include all fields for PUT
- Include only fields to update for PATCH

### Example POST Request
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Error Types
- `VALIDATION_ERROR`: Request validation failed (400)
- `AUTHENTICATION_ERROR`: Authentication failed (401)
- `AUTHORIZATION_ERROR`: Insufficient permissions (403)
- `NOT_FOUND_ERROR`: Resource not found (404)
- `BUSINESS_RULE_ERROR`: Business logic violation (400)
- `FILE_PROCESSING_ERROR`: File processing failed (400)
- `DATABASE_ERROR`: Database operation failed (500)
- `EXTERNAL_SERVICE_ERROR`: External API failure (502)
- `AI_PROCESSING_ERROR`: AI processing failed (500)
- `INTERNAL_SERVER_ERROR`: Unexpected error (500)

## Validation

### Input Validation
- All inputs must be validated using Zod schemas
- Validation occurs before business logic
- Detailed validation errors returned to client

### Validation Schema Example
```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
});
```

## Pagination

### Query Parameters
```
GET /api/v1/users?page=1&limit=20
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Default Values
- `page`: 1
- `limit`: 20
- Maximum `limit`: 100

## Filtering

### Query Parameters
```
GET /api/v1/users?role=STUDENT&isActive=true
```

### Multiple Values
```
GET /api/v1/users?role=STUDENT&role=TEACHER
```

### Range Filters
```
GET /api/v1/assessments?startDate=2024-01-01&endDate=2024-12-31
```

## Sorting

### Query Parameters
```
GET /api/v1/users?sortBy=createdAt&sortOrder=desc
```

### Parameters
- `sortBy`: Field name to sort by
- `sortOrder`: `asc` or `desc` (default: `asc`)

### Multiple Sort Fields
```
GET /api/v1/users?sortBy=createdAt,lastName&sortOrder=desc,asc
```

## Authentication

### JWT Token Structure
```
Authorization: Bearer {jwt_token}
```

### Token Expiration
- Access token: 7 days (configurable)
- Refresh token: To be implemented in MS-2

### Protected Routes
`/health`, registration, and login are public. Logout, current-user, and all user routes require a valid bearer token. Profile lookup additionally applies the role/ownership policy in the implementation-status table.

## Authorization

### Role-Based Access Control (RBAC)
- Roles: STUDENT, TEACHER, ADMIN
- Permissions checked at route level
- Resource-level authorization where needed

### Authorization Header
```typescript
// Middleware checks user role
if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
  throw new AppError(ErrorType.AUTHORIZATION_ERROR, 'Insufficient permissions', 403);
}
```

## Rate Limiting

### Current Limits
- 100 requests per 15 minutes per IP, applied to all `/api` routes.
- Separate, stricter authentication-endpoint limits described in the security design are not implemented.

### Response Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

## CORS Configuration

### Allowed Origins
- Development: `http://localhost:5173`
- Production: Configured via environment variable

### Allowed Methods
- GET, POST, PUT, PATCH, DELETE, OPTIONS

### Allowed Headers
- Content-Type, Authorization

## Standard Status Codes

| Code | Usage |
|------|-------|
| 200  | Success |
| 201  | Resource created |
| 204  | No content (successful deletion) |
| 400  | Bad request (validation, business rule) |
| 401  | Unauthorized (authentication required) |
| 403  | Forbidden (authorization failed) |
| 404  | Resource not found |
| 409  | Conflict (duplicate resource) |
| 422  | Unprocessable entity |
| 429  | Too many requests (rate limit) |
| 500  | Internal server error |
| 502  | Bad gateway (external service) |
| 503  | Service unavailable |

## API Endpoint Categories

### Authentication and Users (MS-2)
Only the routes listed in the implementation-status table above are mounted. Refresh tokens, user collections, generic user update, and user deletion are not implemented.

### Subjects (MS-3)
- `GET /api/v1/subjects`
- `POST /api/v1/subjects`
- `GET /api/v1/subjects/{id}`
- `PUT /api/v1/subjects/{id}`
- `DELETE /api/v1/subjects/{id}`
- `GET /api/v1/subjects/{id}/topics`

### Topics (MS-3)
- `GET /api/v1/topics`
- `POST /api/v1/topics`
- `GET /api/v1/topics/{id}`
- `PUT /api/v1/topics/{id}`
- `DELETE /api/v1/topics/{id}`

### MCQ Assessments (MS-4)
- `GET /api/v1/assessments`
- `POST /api/v1/assessments`
- `GET /api/v1/assessments/{id}`
- `PUT /api/v1/assessments/{id}`
- `DELETE /api/v1/assessments/{id}`
- `POST /api/v1/assessments/{id}/publish`
- `POST /api/v1/assessments/{id}/archive`

### Questions (MS-4)
- `GET /api/v1/questions`
- `POST /api/v1/questions`
- `GET /api/v1/questions/{id}`
- `PUT /api/v1/questions/{id}`
- `DELETE /api/v1/questions/{id}`

### MCQ Attempts (MS-4)
- `POST /api/v1/assessments/{id}/attempts`
- `GET /api/v1/assessments/{id}/attempts`
- `GET /api/v1/attempts/{id}`
- `PUT /api/v1/attempts/{id}/submit`
- `GET /api/v1/attempts/{id}/results`

### Assignments (MS-5)
- `GET /api/v1/assignments`
- `POST /api/v1/assignments`
- `GET /api/v1/assignments/{id}`
- `PUT /api/v1/assignments/{id}`
- `DELETE /api/v1/assignments/{id}`
- `POST /api/v1/assignments/{id}/publish`
- `POST /api/v1/assignments/{id}/close`

### Submissions (MS-6)
- `POST /api/v1/assignments/{id}/submissions`
- `GET /api/v1/assignments/{id}/submissions`
- `GET /api/v1/submissions/{id}`
- `PUT /api/v1/submissions/{id}`

### AI Evaluation (MS-7)
- `POST /api/v1/submissions/{id}/evaluate`
- `GET /api/v1/submissions/{id}/ai-evaluation`

### Teacher Review (MS-8)
- `POST /api/v1/submissions/{id}/review`
- `GET /api/v1/submissions/{id}/review`
- `PUT /api/v1/submissions/{id}/review`

### Analytics (MS-9)
- `GET /api/v1/analytics/student-performance`
- `GET /api/v1/analytics/assessment-results`
- `GET /api/v1/analytics/class-summary`

## Future Enhancements

- GraphQL support (consideration for future)
- WebSocket support for real-time features
- API documentation with Swagger/OpenAPI
- Request/response compression
- API version deprecation policy
- API usage analytics

---

**Document Version**: 1.0
**Last Updated**: 2026-09-26
**Status**: ACTIVE
