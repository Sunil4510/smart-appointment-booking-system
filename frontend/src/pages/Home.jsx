import React from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  CalendarToday, 
  People, 
  Schedule, 
  Star 
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Smart Appointment Booking
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Book appointments with healthcare providers and service professionals easily
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/providers"
            sx={{ mr: 2 }}
          >
            View Providers
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            component={Link} 
            to="/register"
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
        Why Choose Our Platform?
      </Typography>
      
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <CalendarToday sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Easy Booking
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book appointments in just a few clicks with our intuitive interface
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <People sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Trusted Providers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Connect with verified healthcare and service professionals
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Schedule sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Real-time Availability
              </Typography>
              <Typography variant="body2" color="text.secondary">
                See live availability and book appointments instantly
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent>
              <Star sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Quality Service
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rate and review providers to help others make informed decisions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Call to Action */}
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" paragraph>
            Join thousands of satisfied customers who trust our platform
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            component={Link} 
            to="/register"
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Create Account
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Home;