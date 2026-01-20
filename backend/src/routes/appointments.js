import express from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All appointment routes require authentication
router.use(auth);

// Customer appointment routes
router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getUserAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/cancel', appointmentController.cancelAppointment);
router.delete('/:id', appointmentController.cancelAppointment);

// Provider appointment routes
router.get('/provider/:providerId', appointmentController.getProviderAppointments);

export default router;