import express from 'express';
import * as providerController from '../controllers/providerController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', providerController.getAllProviders);
router.get('/:id', providerController.getProviderById);
router.get('/:id/services', providerController.getProviderServices);
router.get('/:id/availability', providerController.getProviderAvailability);
router.get('/:id/stats', providerController.getProviderStats);

// Protected routes
router.post('/', auth, providerController.createProvider);
router.put('/:id', auth, providerController.updateProvider);
router.patch('/:id/availability', auth, providerController.toggleAvailability);

export default router;