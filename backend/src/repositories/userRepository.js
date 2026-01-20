import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * User Repository - Database operations for users
 */

export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  });
};

export const findUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      provider: {
        select: { id: true, businessName: true, isVerified: true }
      }
    }
  });
};

export const findUserProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true
    }
  });
};

export const createUser = async (userData) => {
  const { name, email, passwordHash, phone, role } = userData;
  
  return await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true
    }
  });
};

export const updateUser = async (userId, updateData) => {
  const { name, phone } = updateData;

  return await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone && { phone })
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });
};

export const deleteUser = async (userId) => {
  return await prisma.user.delete({
    where: { id: userId }
  });
};

export const getAllUsers = async (skip, take, role = null) => {
  const where = role ? { role } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total };
};