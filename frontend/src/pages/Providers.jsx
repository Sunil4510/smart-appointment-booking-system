import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Rating
} from '@mui/material';
import { Search, LocationOn, Phone, Email } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { providerService } from '../services/authService';

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProviders, setFilteredProviders] = useState([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await providerService.getAllProviders();
        setProviders(data.providers || []);
        setFilteredProviders(data.providers || []);
      } catch (err) {
        setError('Failed to load providers');
        console.error('Providers error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    // Filter providers based on search term
    if (searchTerm.trim() === '') {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter((provider) =>
        provider.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  }, [searchTerm, providers]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Service Providers
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Find and connect with verified healthcare and service professionals.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search providers by name, business, or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Providers Grid */}
      {filteredProviders.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" textAlign="center" py={4}>
              {searchTerm ? 'No providers found matching your search.' : 'No providers available at the moment.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredProviders.map((provider) => (
            <Grid item xs={12} sm={6} md={4} key={provider.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {provider.user?.name?.charAt(0) || 'P'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="h2">
                        {provider.businessName || provider.user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {provider.user?.name}
                      </Typography>
                    </Box>
                  </Box>

                  {provider.description && (
                    <Typography variant="body2" paragraph>
                      {provider.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    {provider.user?.email && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <Email sx={{ mr: 1, fontSize: 'small' }} />
                        <Typography variant="body2">
                          {provider.user.email}
                        </Typography>
                      </Box>
                    )}
                    
                    {provider.user?.phone && (
                      <Box display="flex" alignItems="center" mb={1}>
                        <Phone sx={{ mr: 1, fontSize: 'small' }} />
                        <Typography variant="body2">
                          {provider.user.phone}
                        </Typography>
                      </Box>
                    )}

                    {(provider.city || provider.state) && (
                      <Box display="flex" alignItems="center">
                        <LocationOn sx={{ mr: 1, fontSize: 'small' }} />
                        <Typography variant="body2">
                          {[provider.city, provider.state].filter(Boolean).join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Services: {provider._count?.services || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Appointments: {provider._count?.appointments || 0}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={provider.isVerified ? "Verified" : "Pending"} 
                      color={provider.isVerified ? "success" : "warning"}
                      size="small"
                    />
                  </Box>

                  {/* Sample rating - you can implement real ratings later */}
                  <Box display="flex" alignItems="center">
                    <Rating value={4.5} precision={0.5} size="small" readOnly />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      (4.5)
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/providers/${provider.id}`}
                  >
                    View Profile
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    component={Link} 
                    to={`/book-appointment?providerId=${provider.id}`}
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Providers;