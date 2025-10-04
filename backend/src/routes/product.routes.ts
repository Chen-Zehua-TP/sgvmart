import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /api/products
router.get('/', getAllProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// POST /api/products (Admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
  ],
  createProduct
);

// PUT /api/products/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), updateProduct);

// DELETE /api/products/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;
