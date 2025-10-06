import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  addExternalProductToCart,
} from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

// GET /api/cart
router.get('/', getCart);

// POST /api/cart/items
router.post(
  '/items',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  ],
  addToCart
);

// POST /api/cart/external - Add external product to cart
router.post(
  '/external',
  [
    body('productName').notEmpty().withMessage('Product name is required'),
    body('productUrl').notEmpty().withMessage('Product URL is required'),
    body('productPrice').isNumeric().withMessage('Product price must be a number'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  addExternalProductToCart
);

// PUT /api/cart/items/:id
router.put(
  '/items/:id',
  [body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')],
  updateCartItem
);

// DELETE /api/cart/items/:id
router.delete('/items/:id', removeFromCart);

// DELETE /api/cart
router.delete('/', clearCart);

export default router;
