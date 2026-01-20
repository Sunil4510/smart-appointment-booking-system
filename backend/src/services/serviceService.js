import * as serviceRepository from '../repositories/serviceRepository.js';
import * as providerRepository from '../repositories/providerRepository.js';
import { NotFoundError, ValidationError, ConflictError } from '../middleware/errorHandler.js';

/**
 * Get all services with pagination and filtering
 */
export const getAllServices = async (page = 1, limit = 10, category = null, providerId = null) => {
    const skip = (page - 1) * limit;
    
    const { services, total } = await serviceRepository.findAllServices(skip, limit, category, providerId);

    return {
      services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

/**
 * Get service by ID
 */
export const getServiceById = async (serviceId) => {
    const service = await serviceRepository.findServiceById(serviceId);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    return service;
  }

/**
 * Create new service
 */
export const createService = async (providerId, serviceData) => {
    const { name, description, duration, price, category } = serviceData;

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      throw new NotFoundError('Provider not found');
    }

    // Check if service name already exists for this provider
    const existingService = await prisma.service.findFirst({
      where: {
        providerId,
        name: { equals: name, mode: 'insensitive' }
      }
    });

    if (existingService) {
      throw new ConflictError('Service with this name already exists for this provider');
    }

    const service = await prisma.service.create({
      data: {
        providerId,
        name,
        description,
        duration,
        price,
        category,
        isActive: true
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return service;
  }

/**
 * Update service
 */
export const updateService = async (serviceId, updateData) => {
    const { name, description, duration, price, category, isActive } = updateData;

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Check if new name conflicts with existing services (if name is being updated)
    if (name && name !== service.name) {
      const existingService = await prisma.service.findFirst({
        where: {
          providerId: service.providerId,
          name: { equals: name, mode: 'insensitive' },
          id: { not: serviceId }
        }
      });

      if (existingService) {
        throw new ConflictError('Service with this name already exists for this provider');
      }
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(duration && { duration }),
        ...(price !== undefined && { price }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        timeSlots: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            dayOfWeek: true,
            isActive: true
          }
        }
      }
    });

    return updatedService;
  }

/**
 * Delete service (soft delete by setting isActive to false)
 */
export const deleteService = async (serviceId) => {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        appointments: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        }
      }
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Check if there are pending appointments
    if (service.appointments.length > 0) {
      throw new ValidationError('Cannot delete service with pending or confirmed appointments');
    }

    const deletedService = await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        isActive: true,
        provider: {
          select: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    return deletedService;
  }

/**
 * Get service categories
 */
export const getServiceCategories = async () => {
    const categories = await prisma.service.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category']
    });

    return categories.map(item => item.category).filter(Boolean).sort();
  }

/**
 * Search services by name or description
 */
export const searchServices = async (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ]
    };

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              
              appointments: true
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.service.count({ where })
    ]);

    return {
      services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      query
    };
  }

/**
 * Get popular services based on appointment count
 */
export const getPopularServices = async (limit = 10) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    include: {
      provider: {
        select: {
          id: true,
          businessName: true,
          user: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          appointments: true
        }
      }
    },
    orderBy: {
      appointments: {
        _count: 'desc'
      }
    },
    take: limit
  });

  return services;
};