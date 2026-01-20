import { NotFoundError, ValidationError, ConflictError, AuthorizationError } from '../middleware/errorHandler.js';
import moment from 'moment-timezone';
import * as appointmentRepository from '../repositories/appointmentRepository.js';

/**
 * Create new appointment with double booking prevention
 */
export const createAppointment = async (userId, appointmentData) => {
  const { serviceId, timeSlotId, appointmentDate, notes } = appointmentData;

  // Validate appointment date
  const appointmentDateTime = moment(appointmentDate).utc();
  if (!appointmentDateTime.isValid()) {
    throw new ValidationError('Invalid appointment date format');
  }

  if (appointmentDateTime.isBefore(moment().utc())) {
    throw new ValidationError('Appointment date cannot be in the past');
  }

  // Validate service and time slot exist
  const [service, timeSlot] = await Promise.all([
    appointmentRepository.findServiceById(serviceId),
    appointmentRepository.findTimeSlotById(timeSlotId)
  ]);

  if (!service) {
    throw new NotFoundError('Service not found');
  }

  if (!service.isActive) {
    throw new ValidationError('Service is not currently available');
  }

  if (!service.provider.isActive) {
    throw new ValidationError('Provider is not currently available');
  }

  if (!timeSlot) {
    throw new NotFoundError('Time slot not found');
  }

  if (!timeSlot.isAvailable) {
    throw new ConflictError('Time slot is no longer available');
  }

  // Validate time slot is not in the past
  const slotTime = moment(timeSlot.startTime);
  if (slotTime.isBefore(moment().add(1, 'hour'))) {
    throw new ValidationError('Cannot book appointments less than 1 hour in advance');
  }

  // Transaction for double booking prevention
  const appointment = await appointmentRepository.createAppointmentTransaction({
    userId: userId,
    providerId: service.providerId,
    serviceId,
    timeSlotId,
    appointmentDate: appointmentDateTime.toDate(),
    totalPrice: service.price,
    notes: notes || null
  });

  return appointment;
};

/**
 * Get user's appointments
 */
export const getUserAppointments = async (userId, status = null, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const { appointments, total } = await appointmentRepository.findUserAppointments(userId, status, skip, limit);

  return {
    appointments,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (appointmentId, userId = null) => {
  const appointment = await appointmentRepository.findAppointmentById(appointmentId);

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  // Check authorization if userId provided
  if (userId && appointment.userId !== userId) {
    throw new AuthorizationError('Access denied to this appointment');
  }

  return appointment;
};

/**
 * Update appointment (reschedule)
 */
export const updateAppointment = async (appointmentId, userId, updateData) => {
  const { timeSlotId, appointmentDate, notes, status } = updateData;

  const appointment = await appointmentRepository.findAppointmentById(appointmentId);

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  // Check authorization
  if (appointment.userId !== userId) {
    throw new AuthorizationError('Access denied to this appointment');
  }

  // Validate current status allows updates
  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    throw new ValidationError('Cannot modify cancelled or completed appointments');
  }

  // If rescheduling (changing time slot or date)
  if (timeSlotId || appointmentDate) {
    if (!timeSlotId || !appointmentDate) {
      throw new ValidationError('Both timeSlotId and appointmentDate are required for rescheduling');
    }

    // Validate new time slot
    const newTimeSlot = await appointmentRepository.findTimeSlotById(timeSlotId);

    if (!newTimeSlot) {
      throw new NotFoundError('Time slot not found');
    }

    // Check if time slot belongs to the same provider as the service
    if (newTimeSlot.providerId !== appointment.service.providerId) {
      throw new NotFoundError('Time slot not found for this service provider');
    }

    if (!newTimeSlot.isAvailable) {
      throw new ConflictError('Selected time slot is not available');
    }

    // Validate new appointment date
    const newAppointmentDateTime = moment(appointmentDate).utc();
    if (!newAppointmentDateTime.isValid()) {
      throw new ValidationError('Invalid appointment date');
    }

    if (newAppointmentDateTime.isBefore(moment().utc())) {
      throw new ValidationError('Cannot reschedule to a past date');
    }

    // Check for conflicts using the provided appointment date
    const conflictingAppointment = await appointmentRepository.findConflictingAppointment(
      appointment.serviceId, 
      newAppointmentDateTime.toDate(), 
      appointmentId
    );

    if (conflictingAppointment) {
      throw new ConflictError('An appointment already exists for this time slot on the selected date');
    }

    // Update appointment using repository transaction
    return await appointmentRepository.updateAppointmentTransaction(appointmentId, {
      timeSlotId,
      appointmentDate: newAppointmentDateTime.toDate(),
      ...(notes !== undefined && { notes }),
      ...(status && { status })
    });
  }

  // Simple update without rescheduling
  return await appointmentRepository.updateAppointment(appointmentId, {
    ...(notes !== undefined && { notes }),
    ...(status && { status })
  });
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (appointmentId, userId, cancelReason = null) => {
  const appointment = await appointmentRepository.findAppointmentById(appointmentId);

  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }

  // Check authorization
  if (appointment.userId !== userId) {
    throw new AuthorizationError('Access denied to this appointment');
  }

  // Validate current status allows cancellation
  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    throw new ValidationError('Cannot cancel already cancelled or completed appointments');
  }

  // Check cancellation policy (e.g., 24 hours before)
  const appointmentTime = moment(appointment.appointmentDate);
  const now = moment().utc();
  const hoursUntilAppointment = appointmentTime.diff(now, 'hours');

  if (hoursUntilAppointment < 24) {
    throw new ValidationError('Appointments can only be cancelled at least 24 hours in advance');
  }

  const cancelledAppointment = await appointmentRepository.updateAppointment(appointmentId, {
    status: 'CANCELLED',
    cancelReason
  });

  return cancelledAppointment;
};

/**
 * Get provider's appointments
 */
export const getProviderAppointments = async (providerId, status = null, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  return await appointmentRepository.findProviderAppointments(providerId, status, skip, limit);
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async (userId = null, providerId = null) => {
  const where = {
    ...(userId && { userId: userId }),
    ...(providerId && { service: { providerId } })
  };

  const stats = await appointmentRepository.getAppointmentStats(userId, providerId);
  
  return {
    total: stats.total,
    pending: stats.pending,
    confirmed: stats.confirmed,
    cancelled: stats.cancelled,
    completed: stats.completed,
    completionRate: stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(2) : 0
  };
};