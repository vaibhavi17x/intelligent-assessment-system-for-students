import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { Container, Typography, Box, CircularProgress } from '@mui/material';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Intelligent Assessment System
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Milestone 2: Authentication & Authorization
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  System Status
                </Typography>
                <Typography variant="body2">
                  Frontend: React + TypeScript + Material-UI - Configured
                </Typography>
                <Typography variant="body2">
                  Backend: Express.js + TypeScript - Configured
                </Typography>
                <Typography variant="body2">
                  Database: PostgreSQL + Prisma - Schema Defined
                </Typography>
                <Typography variant="body2">
                  Architecture: Layered architecture with clear boundaries - Defined
                </Typography>
                <Typography variant="body2">
                  Authentication: JWT-based authentication - Implemented
                </Typography>
                <Typography variant="body2">
                  Authorization: Role-based access control - Implemented
                </Typography>
              </Box>
            </Box>
          </Container>
        }
      />
    </Routes>
  );
}

export default App;
