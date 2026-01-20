import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service Repository - Database operations for services
 */

export const findAllServices = async (skip, take, category = null, providerId = null) => {
  const where = {
    isActive: true,
    ...(category && { category: { contains: category, mode: 'insensitive' } }),
    ...(providerId && { providerId })
  };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take,
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            description: true,
            isActive: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
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

  return { services, total };
};

export const findServiceById = async (serviceId) => {
  return await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: {
          id: true,
          businessName: true,
          description: true,
          isActive: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      },
      timeSlots: {
        where: { isActive: true },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          dayOfWeek: true
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      },
      _count: {
        select: {
          appointments: true
        }
      }
    }
  });
};

export const findServicesByName = async (providerId, name, excludeId = null) => {
  return await prisma.service.findFirst({
    where: {
      providerId,
      name: { equals: name, mode: 'insensitive' },
      ...(excludeId && { id: { not: excludeId } })
    }
  });
};

export const createService = async (serviceData) => {
  return await prisma.service.create({
    data: serviceData,
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
};

export const updateService = async (serviceId, updateData) => {
  return await prisma.service.update({
    where: { id: serviceId },
    data: updateData,
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
};

export const findServiceWithPendingAppointments = async (serviceId) => {
  return await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      appointments: {
        where: {
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      }
    }
  });
};

export const softDeleteService = async (serviceId) => {
  return await prisma.service.update({
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
};

export const findServiceTimeSlots = async (serviceId, dayOfWeek = null, isAvailable = true) => {
  const where = {
    serviceId,
    ...(isAvailable !== null && { isAvailable }),
    ...(dayOfWeek !== null && { dayOfWeek })
  };

  return await prisma.timeSlot.findMany({
    where,
    include: {
      _count: {
        select: {
          appointments: true
        }
      }
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });
};

export const findServiceCategories = async () => {
  const categories = await prisma.service.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category']
  });

  return categories.map(item => item.category).filter(Boolean).sort();
};

export const searchServices = async (query, skip, take) => {
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
      take,
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

  return { services, total };
};

export const findPopularServices = async (limit) => {
  return await prisma.service.findMany({
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
};