import * as userService from '../services/userService.js';
import { validateRegister, validateLogin, validateUpdateProfile } from '../utils/validation.js';

/**
 * Get user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await userService.getUserProfile(userId);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { error } = validateUpdateProfile(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const userId = req.user.id;
    const user = await userService.updateUserProfile(userId, req.body);
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const result = await userService.getAllUsers(
      parseInt(page),
      parseInt(limit),
      role
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user account
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await userService.deleteUser(userId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};