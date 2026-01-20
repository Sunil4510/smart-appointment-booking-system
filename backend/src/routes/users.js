import express from 'express';
import * as userController from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// User routes (all protected)
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.delete('/account', auth, userController.deleteAccount);

// Admin routes
router.get('/', auth, userController.getAllUsers); // Admin only - add role check middleware

export default router;