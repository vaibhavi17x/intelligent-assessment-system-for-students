
# Intelligent Assessment System

An academic project for an AI-assisted assessment system. The current application implements student registration/login, profile and password management, and a protected dashboard. Assessment, assignment, AI evaluation, teacher review, and analytics workflows are planned, not implemented.

## Project Overview

The long-term system is intended to provide these capabilities:

- **MCQ Assessment**: Automated quiz creation, taking, and grading
- **AI-Assigned Assignment Evaluation**: AI-powered suggestion system for grading assignments
- **Teacher Review**: Teacher oversight and final approval of AI suggestions
- **Role-Based Access**: Separate interfaces for Students, Teachers, and Admins
- **Comprehensive Analytics**: Performance tracking and reporting

**Verified current scope (2026-10-17):** Milestone 2 authentication and profile workflows. The database schema includes future-domain models, but no subject, assessment, assignment, evaluation, review, analytics, or notification API routes are currently mounted.

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Context API + React Query
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **File Storage**: Local filesystem service exists; AWS S3 integration is not implemented

### AI/NLP Layer
- **Current status**: Placeholder service only; `isAvailable()` returns false and evaluation returns a zero score.
- **Future providers**: OpenAI API, Hugging Face, or custom models

## Project Structure

```
intelligent-assessment-system/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration management
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic services
│   │   │   ├── ai/         # AI evaluation services
│   │   │   └── storage/    # File storage services
│   │   └── index.ts        # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and API client
│   │   ├── theme/         # Material-UI theme
│   │   └── main.tsx       # Application entry point
│   └── package.json
├── .gitignore
├── package.json           # Root package.json (workspaces)
├── PROJECT_PROGRESS.md    # Project progress documentation
└── README.md
```

## Prerequisites

- Node.js 18+ 
- npm 9+
- PostgreSQL 15+
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Final Year Project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and configure:
   - Database connection string
   - JWT secret (generate a strong random string)
   - Frontend URL
   - Other configuration as needed

4. **Set up the database**
   
   Create a PostgreSQL database:
   ```sql
   CREATE DATABASE intelligent_assessment;
   ```
   
   Run migrations:
   ```bash
   npm run db:migrate
   ```
   
   Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. **Start the development servers**
   
   Start both frontend and backend:
   ```bash
   npm run dev
   ```
   
   Or start individually:
   ```bash
   npm run dev:backend   # Backend on http://localhost:3001
   npm run dev:frontend  # Frontend on http://localhost:5173
   ```

## Development

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run backend tests with coverage
npm run test:coverage --workspace=backend
```

### Linting

```bash
# Lint all code
npm run lint

# Lint and fix
npm run lint:fix
```

### Type Checking

```bash
# Backend type check
cd backend && npm run typecheck

# Frontend type check
cd frontend && npm run typecheck
```

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database
npm run db:seed

# Reset database (WARNING: deletes all data)
npm run db:reset
```

## Architecture

The system follows a layered architecture:

1. **Presentation Layer**: React frontend with Material-UI
2. **API/Application Layer**: Express.js REST API
3. **Domain/Service Layer**: Authentication service is implemented; other workflows are planned
4. **Data Access Layer**: Prisma ORM for database operations
5. **AI/NLP Layer**: Placeholder interface only; no live provider integration
6. **File Processing Layer**: Local storage service only; no upload/download API routes
7. **Infrastructure Layer**: Storage, logging, configuration

## API Documentation

Implemented routes and their actual authorization are documented in [docs/API_ARCHITECTURE.md](docs/API_ARCHITECTURE.md). Swagger/OpenAPI is not configured.

## Security

- JWT-based authentication
- Role-based authorization (RBAC)
- Input validation using Zod
- File upload validation
- Rate limiting
- CORS configuration
- Helmet for security headers
- Secure password hashing with bcrypt

## Milestones

The project is developed in incremental milestones:

1. **Milestone 1**: Technical Foundation & Architecture ✓
2. **Milestone 2**: Authentication & Authorization
3. **Milestone 3**: Academic Structure Management
4. **Milestone 4**: MCQ Assessment System
5. **Milestone 5**: Assignment Management
6. **Milestone 6**: Assignment Submission & Processing
7. **Milestone 7**: AI-Assisted Evaluation
8. **Milestone 8**: Teacher Review System
9. **Milestone 9**: Analytics & Reporting
10. **Milestone 10**: Notifications System
11. **Milestone 11**: Testing & Quality Assurance
12. **Milestone 12**: Deployment & DevOps

See `PROJECT_PROGRESS.md` for detailed progress tracking.

## Contributing

This is an academic project. Contributions should follow the established milestone-based development approach.

## License

This project is developed for academic purposes.

## Support

For project-specific questions, refer to the `PROJECT_PROGRESS.md` documentation or contact the development team.

---

**Current Status**: Milestone 2 implemented; audit passed with limitations on 2026-10-17.
**Last Updated**: 2026-10-17

# intelligent-assessment-system-for-students

