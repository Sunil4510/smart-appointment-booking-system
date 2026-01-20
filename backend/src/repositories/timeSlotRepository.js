import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Time Slot Repository - Database operations for time slots
 */

export const findServiceById = async (serviceId) => {
  return await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: {
          id: true,
          isActive: true,
          user: { select: { name: true, email: true } }
        }
      }
    }
  });
};

export const findProviderById = async (providerId) => {
  return await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      user: { select: { name: true, email: true } }
    }
  });
};

export const findAvailableSlots = async ({ providerId, date, excludeBooked = false }) => {
  const startOfDay = new Date(`${date}T00:00:00Z`);
  const endOfDay = new Date(`${date}T23:59:59Z`);

  const where = {
    providerId,
    startTime: {
      gte: startOfDay,
      lte: endOfDay
    },
    isAvailable: true,
    isBlocked: false
  };

  // If we want to exclude slots that already have appointments
  if (excludeBooked) {
    where.appointment = null; // No appointment linked to this slot
  }

  return await prisma.timeSlot.findMany({
    where,
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      isAvailable: true,
      isBlocked: true,
      appointment: excludeBooked ? false : {
        select: {
          id: true,
          status: true
        }
      }
    }
  });
};

export const findExistingSlot = async ({ providerId, startTime, endTime }) => {
  return await prisma.timeSlot.findFirst({
    where: {
      providerId,
      startTime,
      endTime
    }
  });
};

export const createMultipleSlots = async (slotsData) => {
  return await prisma.timeSlot.createMany({
    data: slotsData,
    skipDuplicates: true
  });
};

export const findSlotById = async (slotId) => {
  return await prisma.timeSlot.findUnique({
    where: { id: slotId },
    include: {
      appointment: {
        select: {
          id: true,
          status: true
        }
      }
    }
  });
};

export const slotHasAppointments = async (slotId) => {
  const slot = await prisma.timeSlot.findUnique({
    where: { id: slotId },
    include: {
      appointment: true
    }
  });
  
  return slot?.appointment && ['PENDING', 'CONFIRMED'].includes(slot.appointment.status);
};

export const updateSlot = async (slotId, updateData) => {
  return await prisma.timeSlot.update({
    where: { id: slotId },
    data: {
      ...updateData,
      updatedAt: new Date()
    }
  });
};

export const findSlotsByProvider = async (providerId, filters = {}) => {
  const where = {
    providerId,
    ...filters
  };

  return await prisma.timeSlot.findMany({
    where,
    orderBy: { startTime: 'asc' },
    include: {
      appointment: {
        select: {
          id: true,
          status: true,
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

export const findSlotsByDateRange = async (providerId, startDate, endDate) => {
  return await prisma.timeSlot.findMany({
    where: {
      providerId,
      startTime: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { startTime: 'asc' },
    include: {
      appointment: {
        select: {
          id: true,
          status: true,
          user: {
            select: { name: true, email: true }
          }
        }
      }
    }
  });
};

export const deleteSlot = async (slotId) => {
  // First check if slot has appointments
  const hasAppointments = await slotHasAppointments(slotId);
  if (hasAppointments) {
    throw new Error('Cannot delete time slot with existing appointments');
  }

  return await prisma.timeSlot.delete({
    where: { id: slotId }
  });
};

export const getSlotStatistics = async (providerId, dateRange = null) => {
  const where = {
    providerId,
    ...(dateRange && {
      startTime: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    })
  };

  const [
    totalSlots,
    availableSlots,
    bookedSlots,
    blockedSlots
  ] = await Promise.all([
    prisma.timeSlot.count({ where }),
    prisma.timeSlot.count({ 
      where: { 
        ...where, 
        isAvailable: true, 
        isBlocked: false,
        appointment: null
      }
    }),
    prisma.timeSlot.count({ 
      where: { 
        ...where, 
        appointment: {
          status: { in: ['PENDING', 'CONFIRMED'] }
        }
      }
    }),
    prisma.timeSlot.count({ 
      where: { 
        ...where, 
        isBlocked: true 
      }
    })
  ]);

  return {
    totalSlots,
    availableSlots,
    bookedSlots,
    blockedSlots,
    utilizationRate: totalSlots > 0 ? ((bookedSlots / totalSlots) * 100).toFixed(2) : 0
  };
};

export default {
  findServiceById,
  findProviderById,
  findAvailableSlots,
  findExistingSlot,
  createMultipleSlots,
  findSlotById,
  slotHasAppointments,
  updateSlot,
  findSlotsByProvider,
  findSlotsByDateRange,
  deleteSlot,
  getSlotStatistics
};