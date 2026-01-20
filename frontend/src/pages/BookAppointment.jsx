import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const steps = ['Select Service', 'Choose Date & Time', 'Confirm Booking'];

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form data
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Load providers on component mount
  useEffect(() => {
    loadProviders();
  }, []);

  // Load services when provider is selected
  useEffect(() => {
    if (selectedProvider) {
      loadServices(selectedProvider);
    }
  }, [selectedProvider]);

  // Load time slots when service and date are selected
  useEffect(() => {
    if (selectedService && selectedDate) {
      loadTimeSlots(selectedService, selectedDate);
    }
  }, [selectedService, selectedDate]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await apiService.get('/api/providers');
      // Handle both array response and object with providers array
      const providersArray = Array.isArray(data) ? data : data.providers || [];
      setProviders(providersArray);
    } catch (err) {
      setError('Failed to load providers');
      setProviders([]); // Ensure providers is always an array
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async (providerId) => {
    try {
      setLoading(true);
      const provider = providers.find(p => p.id === providerId);
      setServices(provider?.services || []);
      setSelectedService('');
    } catch (err) {
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async (serviceId, date) => {
    try {
      setLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      const data = await apiService.get(`/api/services/${serviceId}/slots?date=${formattedDate}`);
      setAvailableSlots(data);
      setSelectedSlot('');
    } catch (err) {
      setError('Failed to load available time slots');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && (!selectedProvider || !selectedService)) {
      setError('Please select both provider and service');
      return;
    }
    if (activeStep === 1 && (!selectedDate || !selectedSlot)) {
      setError('Please select both date and time slot');
      return;
    }
    
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingData = {
        serviceId: selectedService,
        timeSlotId: selectedSlot,
        appointmentDate: selectedDate.toISOString(),
        notes
      };

      const confirmation = await apiService.post('/api/appointments', bookingData);
      setBookingConfirmation(confirmation);
      setSuccess(true);
      setActiveStep(3); // Move to success step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Service Provider & Service
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Choose Provider</InputLabel>
                  <Select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    label="Choose Provider"
                  >
                    {Array.isArray(providers) && providers.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        <Box>
                          <Typography variant="subtitle1">
                            {provider.user?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {provider.businessName}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {services.length > 0 && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Choose Service</InputLabel>
                    <Select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      label="Choose Service"
                    >
                      {Array.isArray(services) && services.map((service) => (
                        <MenuItem key={service.id} value={service.id}>
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1">
                                {service.name}
                              </Typography>
                              <Typography variant="h6" color="primary">
                                ${service.price}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Duration: {service.duration} minutes
                            </Typography>
                            {service.description && (
                              <Typography variant="body2" color="text.secondary">
                                {service.description}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Date & Time
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Appointment Date"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: 'Select a date within the next 30 days'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {availableSlots.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Available Time Slots
                  </Typography>
                  <Grid container spacing={1}>
                    {Array.isArray(availableSlots) && availableSlots.map((slot) => (
                      <Grid item key={slot.id}>
                        <Chip
                          label={`${new Date(slot.startTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - ${new Date(slot.endTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}`}
                          onClick={() => setSelectedSlot(slot.id)}
                          color={selectedSlot === slot.id ? 'primary' : 'default'}
                          variant={selectedSlot === slot.id ? 'filled' : 'outlined'}
                          clickable
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {selectedDate && availableSlots.length === 0 && !loading && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No available time slots for the selected date. Please choose a different date.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        );

      case 2:
        const selectedServiceObj = services.find(s => s.id === selectedService);
        const selectedProviderObj = providers.find(p => p.id === selectedProvider);
        const selectedSlotObj = availableSlots.find(s => s.id === selectedSlot);

        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Your Booking
            </Typography>
            
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appointment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Provider
                    </Typography>
                    <Typography variant="body1">
                      {selectedProviderObj?.user?.name}
                    </Typography>
                    <Typography variant="body2">
                      {selectedProviderObj?.businessName}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Service
                    </Typography>
                    <Typography variant="body1">
                      {selectedServiceObj?.name}
                    </Typography>
                    <Typography variant="body2">
                      Duration: {selectedServiceObj?.duration} minutes
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {selectedDate?.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      {selectedSlotObj && `${new Date(selectedSlotObj.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - ${new Date(selectedSlotObj.endTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}`}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${selectedServiceObj?.price}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes for the provider..."
            />
          </Box>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Alert severity="warning">
            Please log in to book an appointment.
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (success && bookingConfirmation) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 4 }}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary" gutterBottom>
              ✅ Booking Confirmed!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Your appointment has been successfully booked
            </Typography>
            
            <Card sx={{ mt: 3, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Appointment #{bookingConfirmation.id}
                </Typography>
                <Typography variant="body1">
                  We'll send you a confirmation email shortly with all the details.
                </Typography>
              </CardContent>
            </Card>

            <Box>
              <Button 
                variant="contained" 
                onClick={() => navigate('/dashboard')}
                sx={{ mr: 2 }}
              >
                View My Appointments
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setActiveStep(0);
                  setSuccess(false);
                  setSelectedProvider('');
                  setSelectedService('');
                  setSelectedDate(null);
                  setSelectedSlot('');
                  setNotes('');
                  setBookingConfirmation(null);
                }}
              >
                Book Another
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Book Appointment
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        <Box sx={{ minHeight: 300 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleBooking}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookAppointment;