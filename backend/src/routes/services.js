import express from 'express';
import * as serviceController from '../controllers/serviceController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/search', serviceController.searchServices);
router.get('/popular', serviceController.getPopularServices);
router.get('/categories', serviceController.getServiceCategories);
router.get('/:id', serviceController.getServiceById);

// Protected routes (provider only)
router.post('/provider/:providerId', auth, serviceController.createService);
router.put('/:id', auth, serviceController.updateService);
router.delete('/:id', auth, serviceController.deleteService);

export default router;