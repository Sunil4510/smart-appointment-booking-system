import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Provider Repository - Database operations for providers
 */

export const findAllProviders = async (skip, take, specialization = null) => {
  const where = {
    user: { role: 'PROVIDER' },
    ...(specialization && { businessName: { contains: specialization, mode: 'insensitive' } })
  };

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            category: true
          }
        },
        _count: {
          select: {
            services: true,
            appointments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.provider.count({ where })
  ]);

  return { providers, total };
};

export const findProviderById = async (providerId) => {
  return await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      services: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          duration: true,
          category: true,
          isActive: true
        }
      },
      _count: {
        select: {
          services: true,
          appointments: true
        }
      }
    }
  });
};

export const findProviderByUserId = async (userId) => {
  return await prisma.provider.findUnique({
    where: { userId }
  });
};

export const createProvider = async (providerData) => {
  return await prisma.provider.create({
    data: providerData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    }
  });
};

export const updateProvider = async (providerId, updateData) => {
  return await prisma.provider.update({
    where: { id: providerId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      services: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          category: true
        }
      }
    }
  });
};

export const findProviderServices = async (providerId, includeInactive = false) => {
  const where = {
    providerId,
    ...(includeInactive ? {} : { isActive: true })
  };

  return await prisma.service.findMany({
    where,
    include: {
      _count: {
        select: {
          appointments: true,
          timeSlots: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
};

export const findProviderAvailability = async (providerId) => {
  return await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      isActive: true,
      services: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          timeSlots: {
            where: { isActive: true },
            select: {
              id: true,
              startTime: true,
              endTime: true,
              dayOfWeek: true
            }
          }
        }
      }
    }
  });
};

export const toggleProviderAvailability = async (providerId, isAvailable) => {
  return await prisma.provider.update({
    where: { id: providerId },
    data: { isActive: isAvailable },
    select: {
      id: true,
      isActive: true,
      businessName: true,
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
};

export const getProviderStatistics = async (providerId) => {
  const [totalServices, totalAppointments, completedAppointments, activeSlots] = await Promise.all([
    prisma.service.count({
      where: { providerId, isActive: true }
    }),
    prisma.appointment.count({
      where: { 
        service: { providerId }
      }
    }),
    prisma.appointment.count({
      where: { 
        service: { providerId },
        status: 'COMPLETED'
      }
    }),
    prisma.timeSlot.count({
      where: {
        service: { providerId },
        isActive: true
      }
    })
  ]);

  return {
    totalServices,
    totalAppointments,
    completedAppointments,
    activeSlots
  };
};