# Development Environment Setup Guide

This guide provides step-by-step instructions for setting up the development environment for the Intelligent Assessment System.

## Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Should show v18.x.x or higher

2. **npm** (v9 or higher)
   - Usually installed with Node.js
   - Verify installation: `npm --version`
   - Should show 9.x.x or higher

3. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

4. **PostgreSQL** (v15 or higher)
   - Download from: https://www.postgresql.org/download/
   - Windows: Use the installer
   - Mac: `brew install postgresql@15`
   - Linux: Use package manager
   - Verify installation: `psql --version`

5. **VS Code** (recommended)
   - Download from: https://code.visualstudio.com/
   - Recommended extensions:
     - ESLint
     - Prettier
     - TypeScript and JavaScript Language Features
     - Prisma
     - GitLens

### Optional but Recommended

1. **PostgreSQL Client** (for database management)
   - pgAdmin: https://www.pgadmin.org/
   - DBeaver: https://dbeaver.io/

2. **API Testing Tool**
   - Postman: https://www.postman.com/
   - Insomnia: https://insomnia.rest/

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Final Year Project"
```

### 2. Install Dependencies

Install root dependencies and workspace packages:

```bash
npm install
```

This will install:
- Root dependencies (concurrently, prettier, husky, lint-staged)
- Backend dependencies
- Frontend dependencies

### 3. Set Up PostgreSQL Database

#### Create Database

Using psql command line:
```bash
psql -U postgres
```

Then run:
```sql
CREATE DATABASE intelligent_assessment;
CREATE USER assessment_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE intelligent_assessment TO assessment_user;
\q
```

#### Using pgAdmin
1. Open pgAdmin
2. Create a new server connection
3. Create a new database named `intelligent_assessment`

### 4. Configure Environment Variables

#### Backend Environment

Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://assessment_user:secure_password@localhost:5432/intelligent_assessment?schema=public"

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf,.doc,.docx,.txt

# AI Services (to be configured in future milestones)
# OPENAI_API_KEY=your-openai-api-key
# HUGGINGFACE_API_KEY=your-huggingface-api-key

# Logging
LOG_LEVEL=info
```

**Important**: 
- Replace `secure_password` with your actual database password
- Generate a strong JWT secret (at least 32 characters)
- Never commit `.env` files to version control

#### Frontend Environment

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### 5. Initialize Database

#### Generate Prisma Client
```bash
npm run db:generate
```

#### Generate Prisma Client
```bash
npm run db:generate
```

#### Run Migrations
```bash
npm run db:migrate
```

This will create all database tables based on the Prisma schema.

**Warning:** `npm run db:seed` currently deletes all rows from the domain tables before inserting sample data. Do not run it against a database containing data you need to keep.

### 6. Verify Database Connection

You can verify the database connection using Prisma Studio:
```bash
npm run db:studio
```

This will open a web-based database viewer at http://localhost:5555

### 7. Start Development Servers

#### Start Both Frontend and Backend
```bash
npm run dev
```

This will start:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

#### Start Individually

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

### 8. Verify Installation

#### Check Backend Health
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Check Frontend
Open browser to: http://localhost:5173

You should see the Intelligent Assessment System homepage.

## Development Workflow

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

Backend route tests use an in-memory Prisma test double. Any database-backed Jest test must set `TEST_DATABASE_URL` to a disposable database whose name ends in `_test`; the test setup rejects other database names. The frontend coverage provider is not currently installed, so frontend coverage is unavailable.

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
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply new migration
npm run db:migrate

# Reset database (WARNING: deletes all data)
npm run db:reset

# Open Prisma Studio
npm run db:studio
```

## Project Structure Overview

```
intelligent-assessment-system/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuration management
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # Business logic services
│   │   │   ├── ai/         # AI evaluation services
│   │   │   └── storage/    # File storage services
│   │   ├── lib/            # Utilities (logger, database)
│   │   ├── test/           # Test setup and utilities
│   │   └── index.ts        # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding
│   ├── .env.example        # Environment template
│   └── package.json
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and API client
│   │   ├── theme/         # Material-UI theme
│   │   ├── test/          # Test setup
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docs/                   # Documentation
│   ├── API_ARCHITECTURE.md
│   ├── SECURITY_ARCHITECTURE.md
│   └── DEVELOPMENT_SETUP.md
├── .gitignore
├── package.json           # Root package.json (workspaces)
├── PROJECT_PROGRESS.md    # Project progress documentation
└── README.md
```

## Common Issues and Solutions

### Issue: "Cannot connect to database"
**Solution**: 
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database exists and user has permissions

### Issue: "Module not found" errors
**Solution**:
- Run `npm install` in the project root
- Delete node_modules and package-lock.json, then reinstall

### Issue: Port already in use
**Solution**:
- Change PORT in backend/.env
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :3001` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -ti:3001 | xargs kill`

### Issue: Prisma client not generated
**Solution**:
- Run `npm run db:generate`
- Ensure @prisma/client is installed

### Issue: TypeScript errors
**Solution**:
- Run `npm run typecheck` to see all errors
- Ensure all dependencies are installed
- Check tsconfig.json settings

## IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### VS Code Extensions

Recommended extensions:
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- TypeScript and JavaScript Language Features (vscode.typescript-language-features)
- Prisma (Prisma.prisma)
- GitLens (eamodio.git-lens)

## Git Workflow

### Branching Strategy
- `main`: Production code
- `develop`: Development code
- `feature/ms-*`: Feature branches for milestones
- `bugfix/*`: Bug fix branches

### Commit Messages
Follow conventional commits:
- `feat: add user authentication`
- `fix: resolve database connection issue`
- `docs: update API documentation`
- `refactor: improve error handling`

### Pre-commit Hooks
Husky and lint-staged are configured to:
- Run linting on staged files
- Format files with Prettier
- Prevent commits with lint errors

## Performance Tips

### Backend
- Use `tsx watch` for fast TypeScript development
- Enable Prisma query logging in development
- Use environment variable `LOG_LEVEL=debug` for detailed logs

### Frontend
- Vite provides fast HMR (Hot Module Replacement)
- Use React DevTools for debugging
- Enable source maps in development

## Security Notes for Development

1. **Never commit `.env` files** - They contain sensitive information
2. **Use strong JWT secrets** - Even in development
3. **Change default passwords** - Don't use default database credentials
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Review security advisories** - Check for vulnerabilities

## Next Steps

After completing the setup:

1. Review the architecture documentation
2. Check the PROJECT_PROGRESS.md for current status
3. Start with Milestone 2: Authentication & Authorization
4. Follow the established patterns for new features

## Support

For issues or questions:
- Check the PROJECT_PROGRESS.md for known issues
- Review the architecture documentation
- Contact the development team

---

**Document Version**: 1.0
**Last Updated**: 2026-09-26
**Status**: ACTIVE
