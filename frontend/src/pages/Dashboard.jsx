import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentService } from '../services/authService';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [appointmentsData, statsData] = await Promise.all([
          appointmentService.getUserAppointments({ limit: 5 }),
          appointmentService.getAppointmentStats()
        ]);
        
        setAppointments(appointmentsData.appointments || []);
        setStats(statsData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (!isAuthenticated()) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" mt={4}>
          <Typography variant="h4" gutterBottom>
            Please sign in to view your dashboard
          </Typography>
          <Button variant="contained" component={Link} to="/login">
            Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'CONFIRMED': 'primary',
      'COMPLETED': 'success',
      'CANCELLED': 'error'
    };
    return colors[status] || 'default';
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleOpen(true);
    setNewDate(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
  };

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelOpen(true);
    setCancelReason('');
  };

  const fetchAvailableSlots = async (date) => {
    if (!selectedAppointment || !date) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/services/${selectedAppointment.serviceId}/slots?date=${date.toISOString().split('T')[0]}`
      );
      const slots = await response.json();
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment || !newDate || !selectedSlot) return;

    try {
      setActionLoading(true);
      const response = await appointmentService.updateAppointment(selectedAppointment.id, {
        timeSlotId: selectedSlot,
        appointmentDate: newDate.toISOString()
      });

      if (response) {
        // Refresh appointments
        const updatedAppointments = await appointmentService.getAppointments({ limit: 5 });
        setAppointments(updatedAppointments.appointments || []);
        setRescheduleOpen(false);
        setSelectedAppointment(null);
      }
    } catch (err) {
      setError('Failed to reschedule appointment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      await appointmentService.cancelAppointment(selectedAppointment.id, cancelReason);
      
      // Refresh appointments
      const updatedAppointments = await appointmentService.getAppointments({ limit: 5 });
      setAppointments(updatedAppointments.appointments || []);
      setCancelOpen(false);
      setSelectedAppointment(null);
    } catch (err) {
      setError('Failed to cancel appointment: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Total Appointments
              </Typography>
              <Typography variant="h4">
                {stats.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Upcoming
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.confirmed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Completion Rate
              </Typography>
              <Typography variant="h4">
                {stats.completionRate || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Appointments */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Appointments
        </Typography>
        
        {appointments.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" textAlign="center" py={2}>
                No appointments yet. 
                <Button component={Link} to="/book-appointment" sx={{ ml: 1 }}>
                  Book your first appointment
                </Button>
              </Typography>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center">
                  <Box>
                    <Typography variant="h6">
                      {appointment.service?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Provider: {appointment.service?.provider?.user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Date: {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Time: {appointment.timeSlot?.startTime ? 
                        new Date(appointment.timeSlot.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'N/A'
                      } - {appointment.timeSlot?.endTime ? 
                        new Date(appointment.timeSlot.endTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'N/A'
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total: ${appointment.totalPrice}
                    </Typography>
                    {appointment.notes && (
                      <Typography variant="body2" color="text.secondary">
                        Notes: {appointment.notes}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                    <Chip 
                      label={appointment.status}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                    {appointment.status === 'PENDING' || appointment.status === 'CONFIRMED' ? (
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleReschedule(appointment)}
                          disabled={new Date(appointment.appointmentDate) < new Date()}
                        >
                          Reschedule
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCancel(appointment)}
                          disabled={new Date(appointment.appointmentDate) < new Date()}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Quick Actions */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button 
              variant="contained" 
              component={Link} 
              to="/book-appointment"
              size="large"
            >
              Book New Appointment
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/providers"
              size="large"
            >
              Browse Providers
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Appointment: {selectedAppointment?.service?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Provider: {selectedAppointment?.service?.provider?.user?.name}
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="New Date"
                value={newDate}
                onChange={(date) => {
                  setNewDate(date);
                  if (date) {
                    fetchAvailableSlots(date);
                  }
                }}
                minDate={new Date()}
                sx={{ mt: 2, mb: 2, width: '100%' }}
              />
            </LocalizationProvider>

            {actionLoading && <CircularProgress size={24} />}
            
            {availableSlots.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Time Slots
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {availableSlots.map((slot) => (
                    <Chip
                      key={slot.id}
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
                  ))}
                </Box>
              </Box>
            )}

            {newDate && availableSlots.length === 0 && !actionLoading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                No available time slots for the selected date. Please choose a different date.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmReschedule} 
            variant="contained"
            disabled={!newDate || !selectedSlot || actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Reschedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to cancel your appointment for {selectedAppointment?.service?.name}?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Date: {selectedAppointment?.appointmentDate ? 
              new Date(selectedAppointment.appointmentDate).toLocaleDateString() : 'N/A'}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Cancellation Reason (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Keep Appointment</Button>
          <Button 
            onClick={confirmCancel} 
            variant="contained" 
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;