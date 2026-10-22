import React from 'react';
import { Container, Paper, Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error.main';
      case 'TEACHER':
        return 'warning.main';
      case 'STUDENT':
        return 'success.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1">
                    <strong>Name:</strong> {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Email:</strong> {user?.email}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Role:</strong>{' '}
                    <Box component="span" sx={{ color: getRoleColor(user?.role || '') }}>
                      {user?.role}
                    </Box>
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Member Since:</strong>{' '}
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/change-password')}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/profile')}
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to the Intelligent Assessment System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is Milestone 2: Authentication & Authorization. The system now supports user
            registration, login, logout, and role-based access control. More features will be
            implemented in upcoming milestones.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
