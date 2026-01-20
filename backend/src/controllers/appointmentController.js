import * as appointmentService from '../services/appointmentService.js';
import { validateCreateAppointment, validateUpdateAppointment } from '../utils/validation.js';

/**
 * Create new appointment
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { error } = validateCreateAppointment(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.id;
    const appointment = await appointmentService.createAppointment(userId, req.body);
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's appointments
 */
export const getUserAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;
    
    const result = await appointmentService.getUserAppointments(
      userId,
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment by ID
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const appointment = await appointmentService.getAppointmentById(
      parseInt(id),
      userId
    );
    
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment (reschedule)
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { error } = validateUpdateAppointment(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const { id } = req.params;
    const userId = req.user.id;
    
    const appointment = await appointmentService.updateAppointment(
      parseInt(id),
      userId,
      req.body
    );
    
    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;
    
    const appointment = await appointmentService.cancelAppointment(
      parseInt(id),
      userId,
      reason
    );
    
    res.status(200).json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get provider's appointments
 */
export const getProviderAppointments = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    const result = await appointmentService.getProviderAppointments(
      parseInt(providerId),
      status,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { providerId } = req.query;
    
    const stats = await appointmentService.getAppointmentStats(
      userId,
      providerId ? parseInt(providerId) : null
    );
    
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};