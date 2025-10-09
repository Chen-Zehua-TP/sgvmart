import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import {
  getUserById,
  updateUser,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../services/user.service';

export const getUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    const user = await getUserById(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Users can only update their own profile unless they're admin
    if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
      throw new AppError('Not authorized', 403);
    }

    const user = await updateUser(id, req.body);

    res.json({ user });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

export const getAddresses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const addresses = await getUserAddresses(req.user.id);
    res.json({ addresses });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to get addresses' });
  }
};

export const addAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const address = await createAddress(req.user.id, req.body);
    res.status(201).json({ address });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create address' });
  }
};

export const modifyAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const address = await updateAddress(id, req.user.id, req.body);
    res.json({ address });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update address' });
  }
};

export const removeAddress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    await deleteAddress(id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to delete address' });
  }
};
