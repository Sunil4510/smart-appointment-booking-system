import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError, ConflictError, AuthenticationError, NotFoundError } from '../middleware/errorHandler.js';
import * as userRepository from '../repositories/userRepository.js';

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const { name, email, password, phone, role = 'CUSTOMER' } = userData;

  // Check if user already exists
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash: hashedPassword,
    phone,
    role
  });

  return user;
};

/**
 * Authenticate user and generate tokens
 */
export const loginUser = async (email, password) => {
  // Find user
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Generate tokens
  const tokens = generateTokens(user);

  // Return user data without password
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    tokens
  };
};

/**
 * Generate JWT tokens
 */
export const generateTokens = (user) => {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: '1d'
    };
  }

/**
 * Refresh JWT token
 */
export const refreshToken = async (refreshTokenValue) => {
  try {
    const decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
      
    const user = await userRepository.findUserById(decoded.userId);
    if (!user) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const tokens = generateTokens(user);
    return tokens;
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  const user = await userRepository.findUserProfile(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updateData) => {
  return await userRepository.updateUser(userId, updateData);
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (page = 1, limit = 10, role = null) => {
  const skip = (page - 1) * limit;
  
  const { users, total } = await userRepository.getAllUsers(skip, limit, role);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Delete user account
 */
export const deleteUser = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await userRepository.deleteUser(userId);
  return { message: 'User account deleted successfully' };
};