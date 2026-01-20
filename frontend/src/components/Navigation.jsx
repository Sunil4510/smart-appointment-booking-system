import React from 'react';
import { Button, Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isAuthenticated()) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/providers">
          Providers
        </Button>
        <Button color="inherit" component={Link} to="/book-appointment">
          Book Appointment
        </Button>
        <Button color="inherit" onClick={handleLogout}>
          Logout ({user?.name})
        </Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={2}>
      <Button color="inherit" component={Link} to="/">
        Home
      </Button>
      <Button color="inherit" component={Link} to="/providers">
        Providers
      </Button>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
      <Button color="inherit" component={Link} to="/register">
        Register
      </Button>
    </Stack>
  );
};

export default Navigation;