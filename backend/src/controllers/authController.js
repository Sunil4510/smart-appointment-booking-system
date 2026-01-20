import * as userService from '../services/userService.js';
import { validateRegister, validateLogin } from '../utils/validation.js';

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const user = await userService.registerUser(req.body);
    const tokens = userService.generateTokens(user);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }

    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    
    res.status(200).json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required'
      });
    }

    const tokens = await userService.refreshToken(refreshToken);
    
    res.status(200).json({
      message: 'Token refreshed successfully',
      tokens
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    // In a production app, you would blacklist the token
    // or remove it from a token store
    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
};