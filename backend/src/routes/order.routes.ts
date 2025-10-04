import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// GET /api/orders
router.get('/', getUserOrders);

// GET /api/orders/:id
router.get('/:id', getOrderById);

// POST /api/orders
router.post(
  '/',
  [
    body('addressId').notEmpty().withMessage('Address ID is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  createOrder
);

// PUT /api/orders/:id (Admin only)
router.put('/:id', authorize('ADMIN'), updateOrderStatus);

export default router;
