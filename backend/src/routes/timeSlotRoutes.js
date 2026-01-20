import express from 'express';
import timeSlotController from '../controllers/timeSlotController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Time Slot Routes
 */

// Get available time slots for a service
router.get('/services/:serviceId/slots', timeSlotController.getServiceTimeSlots);

// Get available time slots for a provider  
router.get('/providers/:providerId/slots', timeSlotController.getProviderTimeSlots);

// Create time slots for a provider (Protected - Provider/Admin only)
router.post('/providers/:providerId/slots', authenticateToken, timeSlotController.createTimeSlots);

export default router;