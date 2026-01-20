import * as serviceService from '../services/serviceService.js';

/**
 * Get all services
 */
export const getAllServices = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, providerId } = req.query;
    const result = await serviceService.getAllServices(
      parseInt(page),
      parseInt(limit),
      category,
      providerId ? parseInt(providerId) : null
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 */
export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await serviceService.getServiceById(parseInt(id));
    
    res.status(200).json(service);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new service
 */
export const createService = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const service = await serviceService.createService(parseInt(providerId), req.body);
    
    res.status(201).json({
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service
 */
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await serviceService.updateService(parseInt(id), req.body);
    
    res.status(200).json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service
 */
export const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await serviceService.deleteService(parseInt(id));
    
    res.status(200).json({
      message: 'Service deleted successfully',
      service
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service categories
 */
export const getServiceCategories = async (req, res, next) => {
  try {
    const categories = await serviceService.getServiceCategories();
    
    res.status(200).json({
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search services
 */
export const searchServices = async (req, res, next) => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const result = await serviceService.searchServices(
      query,
      parseInt(page),
      parseInt(limit)
    );
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get popular services
 */
export const getPopularServices = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const services = await serviceService.getPopularServices(parseInt(limit));
    
    res.status(200).json({
      services
    });
  } catch (error) {
    next(error);
  }
};