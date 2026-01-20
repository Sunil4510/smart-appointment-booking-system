import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import * as providerRepository from '../repositories/providerRepository.js';
import * as userRepository from '../repositories/userRepository.js';

/**
 * Get all service providers with pagination and filtering
 */
export const getAllProviders = async (page = 1, limit = 10, specialization = null) => {
  const skip = (page - 1) * limit;
  
  const { providers, total } = await providerRepository.findAllProviders(skip, limit, specialization);

  return {
    providers,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get provider by ID
 */
export const getProviderById = async (providerId) => {
  const provider = await providerRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }
  return provider;
};

/**
 * Get provider's services
 */
export const getProviderServices = async (providerId, includeInactive = false) => {
  // Validate provider exists
  const provider = await providerRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return await providerRepository.findProviderServices(providerId, includeInactive);
};

/**
 * Create new provider profile
 */
export const createProvider = async (userId, providerData) => {
  const { specialization, bio, isAvailable = true } = providerData;

  // Check if user exists and has PROVIDER role
  const user = await userRepository.findUserById(userId);
  if (!user || user.role !== 'PROVIDER') {
    throw new ValidationError('User must have PROVIDER role to create provider profile');
  }

  // Check if provider profile already exists
  const existingProvider = await providerRepository.findProviderByUserId(userId);
  if (existingProvider) {
    throw new ValidationError('Provider profile already exists for this user');
  }

  return await providerRepository.createProvider({
    userId,
    specialization,
    bio,
    isAvailable
  });
};

/**
 * Update provider profile
 */
export const updateProvider = async (providerId, updateData) => {
  // Validate provider exists
  const provider = await providerRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  const { specialization, bio, isAvailable } = updateData;
  const updates = {};
  
  if (specialization) updates.specialization = specialization;
  if (bio !== undefined) updates.bio = bio;
  if (isAvailable !== undefined) updates.isAvailable = isAvailable;

  return await providerRepository.updateProvider(providerId, updates);
};

/**
 * Get provider availability status
 */
export const getProviderAvailability = async (providerId) => {
  const provider = await providerRepository.findProviderAvailability(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }
  return provider;
};

/**
 * Toggle provider availability
 */
export const toggleProviderAvailability = async (providerId) => {
  const provider = await providerRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  return await providerRepository.toggleProviderAvailability(providerId, !provider.isActive);
};

/**
 * Get provider statistics
 */
export const getProviderStats = async (providerId) => {
  const provider = await providerRepository.findProviderById(providerId);
  if (!provider) {
    throw new NotFoundError('Provider not found');
  }

  const statistics = await providerRepository.getProviderStatistics(providerId);
  
  return {
    providerId,
    ...statistics,
    completionRate: statistics.totalAppointments > 0 
      ? (statistics.completedAppointments / statistics.totalAppointments * 100).toFixed(2) 
      : 0
  };
};