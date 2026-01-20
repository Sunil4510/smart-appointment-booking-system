import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import * as timeSlotRepository from '../repositories/timeSlotRepository.js';
import moment from 'moment-timezone';

/**
 * Get available time slots for a service on a specific date
 */
export const getAvailableSlots = async (serviceId, dateString) => {
  // Validate that the service exists
  const service = await timeSlotRepository.findServiceById(serviceId);
  if (!service) {
    throw new NotFoundError('Service not found');
  }

  if (!service.isActive) {
    throw new ValidationError('Service is not currently active');
  }

  // Parse the date
  const targetDate = moment(dateString).startOf('day');
  if (!targetDate.isValid()) {
    throw new ValidationError('Invalid date format');
  }

  // Don't allow booking too far in the future (e.g., 90 days)
  if (targetDate.isAfter(moment().add(90, 'days'))) {
    throw new ValidationError('Cannot book appointments more than 90 days in advance');
  }

  // Get available slots for this date
  const availableSlots = await timeSlotRepository.findAvailableSlots({
    providerId: service.providerId,
    date: targetDate.format('YYYY-MM-DD'),
    excludeBooked: true
  });

  // Filter slots that are for the correct date and not in the past
  const now = moment();
  return availableSlots.filter(slot => {
    const slotTime = moment(slot.startTime);
    return slotTime.format('YYYY-MM-DD') === targetDate.format('YYYY-MM-DD') && 
           slotTime.isAfter(now.add(1, 'hour')); // Must be at least 1 hour from now
  });
};

/**
 * Get available time slots for a provider on a specific date
 */
export const getProviderAvailableSlots = async (providerId, dateString) => {
  // Validate that the provider exists
  const provider = await timeSlotRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  if (!provider.isActive) {
    throw new ValidationError('Provider is not currently active');
  }

  const targetDate = moment(dateString).startOf('day');
  if (!targetDate.isValid()) {
    throw new ValidationError('Invalid date format');
  }

  if (targetDate.isBefore(moment().startOf('day'))) {
    throw new ValidationError('Cannot view slots for past dates');
  }

  const availableSlots = await timeSlotRepository.findAvailableSlots({
    providerId,
    date: targetDate.format('YYYY-MM-DD'),
    excludeBooked: true
  });

  const now = moment();
  return availableSlots.filter(slot => {
    const slotTime = moment(slot.startTime);
    return slotTime.format('YYYY-MM-DD') === targetDate.format('YYYY-MM-DD') && 
           slotTime.isAfter(now);
  });
};

/**
 * Create time slots for a provider
 */
export const createTimeSlots = async (providerId, slotData) => {
  const { date, startTime, endTime, slotDuration = 60 } = slotData;

  // Validate provider exists
  const provider = await timeSlotRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  // Parse date and times
  const targetDate = moment(date).startOf('day');
  if (!targetDate.isValid()) {
    throw new ValidationError('Invalid date format');
  }

  if (targetDate.isBefore(moment().startOf('day'))) {
    throw new ValidationError('Cannot create slots for past dates');
  }

  // Parse start and end times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (startHour >= endHour || (startHour === endHour && startMinute >= endMinute)) {
    throw new ValidationError('Start time must be before end time');
  }

  // Generate time slots
  const slots = [];
  const currentSlot = targetDate.clone().hour(startHour).minute(startMinute);
  const endOfDay = targetDate.clone().hour(endHour).minute(endMinute);

  while (currentSlot.clone().add(slotDuration, 'minutes').isSameOrBefore(endOfDay)) {
    const slotStart = currentSlot.clone();
    const slotEnd = currentSlot.clone().add(slotDuration, 'minutes');

    // Check if slot already exists
    const existingSlot = await timeSlotRepository.findExistingSlot({
      providerId,
      startTime: slotStart.toDate(),
      endTime: slotEnd.toDate()
    });

    if (!existingSlot) {
      slots.push({
        providerId,
        startTime: slotStart.toDate(),
        endTime: slotEnd.toDate(),
        isAvailable: true,
        isBlocked: false
      });
    }

    currentSlot.add(slotDuration, 'minutes');
  }

  if (slots.length === 0) {
    throw new ValidationError('No new time slots to create (slots may already exist)');
  }

  // Create the slots
  const createdSlots = await timeSlotRepository.createMultipleSlots(slots);
  
  return createdSlots;
};

/**
 * Block/unblock a time slot
 */
export const toggleSlotAvailability = async (slotId, providerId, isBlocked) => {
  const slot = await timeSlotRepository.findSlotById(slotId);
  
  if (!slot) {
    throw new NotFoundError('Time slot not found');
  }

  if (slot.providerId !== providerId) {
    throw new ValidationError('You can only modify your own time slots');
  }

  // Check if slot has existing appointments
  if (isBlocked) {
    const hasAppointments = await timeSlotRepository.slotHasAppointments(slotId);
    if (hasAppointments) {
      throw new ValidationError('Cannot block a time slot that has existing appointments');
    }
  }

  return await timeSlotRepository.updateSlot(slotId, {
    isBlocked,
    isAvailable: !isBlocked
  });
};

export default {
  getAvailableSlots,
  getProviderAvailableSlots,
  createTimeSlots,
  toggleSlotAvailability
};