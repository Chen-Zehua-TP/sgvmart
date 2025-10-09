import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
    },
  });

  return user;
};

export const updateUser = async (id: string, data: any) => {
  const { email, firstName, lastName, phone } = data;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });

    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(email && { email }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(phone !== undefined && { phone }),
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

export const getUserAddresses = async (userId: string) => {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: 'desc' },
  });

  return addresses;
};

export const createAddress = async (userId: string, data: any) => {
  const { street, city, state, zipCode, country, isDefault } = data;

  // If this is set as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    },
  });

  return address;
};

export const updateAddress = async (
  addressId: string,
  userId: string,
  data: any
) => {
  // Verify ownership
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new AppError('Address not found', 404);
  }

  const { street, city, state, zipCode, country, isDefault } = data;

  // If this is set as default, unset other defaults
  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, NOT: { id: addressId } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: addressId },
    data: {
      ...(street && { street }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zipCode && { zipCode }),
      ...(country && { country }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  return address;
};

export const deleteAddress = async (addressId: string, userId: string) => {
  // Verify ownership
  const existingAddress = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existingAddress) {
    throw new AppError('Address not found', 404);
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return { success: true };
};
