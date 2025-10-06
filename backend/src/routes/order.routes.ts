import { Router } from 'express';
import { body } from 'express-validator';
import {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  createExternalProductOrder,
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

// POST /api/orders/external - for external products (like GGSel)
router.post(
  '/external',
  [
    body('productName').notEmpty().withMessage('Product name is required'),
    body('productUrl').notEmpty().withMessage('Product URL is required'),
    body('productPrice').isNumeric().withMessage('Product price must be a number'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  createExternalProductOrder
);

// PUT /api/orders/:id (Admin only)
router.put('/:id', authorize('ADMIN'), updateOrderStatus);

export default router;
