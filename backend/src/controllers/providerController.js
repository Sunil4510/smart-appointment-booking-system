import * as providerService from '../services/providerService.js';

/**
 * Get all providers
 */
export const getAllProviders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, specialization } = req.query;
    const result = await providerService.getAllProviders(
      parseInt(page),
      parseInt(limit),
      specialization
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get provider by ID
 */
export const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await providerService.getProviderById(parseInt(id));
    
    res.status(200).json(provider);
  } catch (error) {
    next(error);
  }
};

/**
 * Get provider's services
 */
export const getProviderServices = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeInactive = false } = req.query;
    
    const services = await providerService.getProviderServices(
      parseInt(id),
      includeInactive === 'true'
    );
    
    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

/**
 * Create provider profile
 */
export const createProvider = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const provider = await providerService.createProvider(userId, req.body);
    
    res.status(201).json({
      message: 'Provider profile created successfully',
      provider
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update provider profile
 */
export const updateProvider = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await providerService.updateProvider(parseInt(id), req.body);
    
    res.status(200).json({
      message: 'Provider profile updated successfully',
      provider
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get provider availability
 */
export const getProviderAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const availability = await providerService.getProviderAvailability(parseInt(id));
    
    res.status(200).json(availability);
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle provider availability
 */
export const toggleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await providerService.toggleProviderAvailability(parseInt(id));
    
    res.status(200).json({
      message: `Provider availability ${provider.isActive ? 'enabled' : 'disabled'}`,
      provider
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get provider statistics
 */
export const getProviderStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await providerService.getProviderStats(parseInt(id));
    
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};