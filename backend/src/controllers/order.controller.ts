import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import * as orderService from '../services/order.service';

export const getUserOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const orders = await orderService.getUserOrders(req.user.id);
    res.json({ orders });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to get orders' });
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const order = await orderService.getOrderById(id, req.user.id);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({ order });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to get order' });
  }
};

export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { addressId, paymentMethod, paymentIntentId } = req.body;

    const order = await orderService.createOrder(
      req.user.id,
      addressId,
      paymentMethod,
      paymentIntentId
    );

    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(id, status);

    res.json({ order });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to update order' });
  }
};

export const createExternalProductOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { productName, productUrl, productPrice, productImageUrl, quantity } = req.body;

    const order = await orderService.createExternalProductOrder(
      req.user.id,
      productName,
      productUrl,
      productPrice,
      productImageUrl,
      quantity || 1
    );

    res.status(201).json({ order });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
};
