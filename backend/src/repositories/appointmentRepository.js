import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Appointment Repository - Database operations for appointments
 */

export const findServiceById = async (serviceId) => {
  return await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      provider: {
        select: {
          id: true,
          isActive: true,
          user: { select: { name: true } }
        }
      }
    }
  });
};

export const findTimeSlotById = async (timeSlotId) => {
  return await prisma.timeSlot.findUnique({
    where: { id: timeSlotId }
  });
};

export const findConflictingAppointment = async (serviceId, appointmentDate, excludeId = null) => {
  return await prisma.appointment.findFirst({
    where: {
      serviceId,
      appointmentDate,
      status: { in: ['PENDING', 'CONFIRMED'] },
      ...(excludeId && { id: { not: excludeId } })
    }
  });
};

export const createAppointmentTransaction = async (appointmentData) => {
  return await prisma.$transaction(async (tx) => {
    // Re-check slot availability with row lock
    const lockedSlot = await tx.timeSlot.findFirst({
      where: {
        id: appointmentData.timeSlotId,
        isAvailable: true
      }
    });

    if (!lockedSlot) {
      throw new Error('Time slot is no longer available');
    }

    // Check for conflicting appointments on the same time slot
    const conflictingAppointment = await tx.appointment.findFirst({
      where: {
        timeSlotId: appointmentData.timeSlotId,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (conflictingAppointment) {
      throw new Error('An appointment already exists for this time slot on the selected date');
    }

    // Create appointment
    return await tx.appointment.create({
      data: appointmentData,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            provider: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        timeSlot: {
          select: {
            id: true,
            startTime: true,
            endTime: true
          }
        },
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
  });
};

export const findUserAppointments = async (userId, status = null, skip, take) => {
  const where = {
    userId: userId,
    ...(status && { status })
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            category: true,
            provider: {
              select: {
                id: true,
                businessName: true,
                description: true,
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        timeSlot: {
          select: {
            id: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.appointment.count({ where })
  ]);

  return { appointments, total };
};

export const findAppointmentById = async (appointmentId) => {
  return await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: {
        select: {
          id: true,
          providerId: true,
          name: true,
          description: true,
          duration: true,
          price: true,
          category: true,
          provider: {
            select: {
              id: true,
              businessName: true,
              description: true,
              bio: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      },
      timeSlot: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          
        }
      },
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

export const updateAppointment = async (appointmentId, updateData) => {
  return await prisma.appointment.update({
    where: { id: appointmentId },
    data: updateData,
    include: {
      service: {
        select: {
          id: true,
          name: true,
          duration: true,
          price: true,
          provider: {
            select: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      },
      timeSlot: {
        select: {
          startTime: true,
          endTime: true,
          
        }
      }
    }
  });
};

export const updateAppointmentTransaction = async (appointmentId, updateData) => {
  return await prisma.$transaction(async (tx) => {
    // Check for conflicts on new time if rescheduling
    if (updateData.timeSlotId) {
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          timeSlotId: updateData.timeSlotId,
          status: { in: ['PENDING', 'CONFIRMED'] },
          id: { not: appointmentId }
        }
      });

      if (conflictingAppointment) {
        throw new Error('An appointment already exists for this time slot on the selected date');
      }
    }

    // Update appointment
    return await tx.appointment.update({
      where: { id: appointmentId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true,
            provider: {
              select: {
                user: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            
          }
        }
      }
    });
  });
};

export const findProviderAppointments = async (providerId, status = null, skip, take) => {
  const where = {
    service: { providerId },
    ...(status && { status })
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      skip,
      take,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            duration: true,
            price: true
          }
        },
        timeSlot: {
          select: {
            startTime: true,
            endTime: true,
            
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.appointment.count({ where })
  ]);

  return { appointments, total };
};

export const getAppointmentStatistics = async (userId = null, providerId = null) => {
  const where = {
    ...(userId && { userId: userId }),
    ...(providerId && { service: { providerId } })
  };

  const [total, pending, confirmed, cancelled, completed] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.count({ where: { ...where, status: 'PENDING' } }),
    prisma.appointment.count({ where: { ...where, status: 'CONFIRMED' } }),
    prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { ...where, status: 'COMPLETED' } })
  ]);

  return {
    total,
    pending,
    confirmed,
    cancelled,
    completed
  };
};

// Alias for backward compatibility
export const getAppointmentStats = getAppointmentStatistics;