import { asyncHandler } from '../middleware/errorHandler.js';
import * as timeSlotService from '../services/timeSlotService.js';
import * as validationSchemas from '../middleware/validation.js';

/**
 * Get available time slots for a service on a specific date
 * GET /api/services/:serviceId/slots?date=YYYY-MM-DD
 */
export const getServiceTimeSlots = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Date parameter is required (format: YYYY-MM-DD)'
    });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      error: 'Validation Error', 
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }

  const serviceIdNum = parseInt(serviceId);
  if (isNaN(serviceIdNum)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Service ID must be a valid number'
    });
  }

  const availableSlots = await timeSlotService.getAvailableSlots(serviceIdNum, date);
  
  res.status(200).json(availableSlots);
});

/**
 * Get time slots for a provider
 * GET /api/providers/:providerId/slots?date=YYYY-MM-DD
 */
export const getProviderTimeSlots = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Date parameter is required (format: YYYY-MM-DD)'
    });
  }

  const providerIdNum = parseInt(providerId);
  if (isNaN(providerIdNum)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Provider ID must be a valid number'
    });
  }

  const availableSlots = await timeSlotService.getProviderAvailableSlots(providerIdNum, date);
  
  res.status(200).json(availableSlots);
});

/**
 * Create time slots for a provider (Provider only)
 * POST /api/providers/:providerId/slots
 */
export const createTimeSlots = asyncHandler(async (req, res) => {
  const { providerId } = req.params;
  const { error, value } = validationSchemas.createTimeSlots.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.details[0].message
    });
  }

  // Check if user is the provider or admin
  if (req.user.role !== 'ADMIN' && req.user.providerId !== parseInt(providerId)) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'You can only create time slots for your own services'
    });
  }

  const timeSlots = await timeSlotService.createTimeSlots(parseInt(providerId), value);
  
  res.status(201).json({
    message: 'Time slots created successfully',
    timeSlots
  });
});

export default {
  getServiceTimeSlots,
  getProviderTimeSlots,
  createTimeSlots
};