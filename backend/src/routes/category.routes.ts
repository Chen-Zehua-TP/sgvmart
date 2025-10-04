import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// GET /api/categories
router.get('/', getAllCategories);

// GET /api/categories/:id
router.get('/:id', getCategoryById);

// POST /api/categories (Admin only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
  ],
  createCategory
);

// PUT /api/categories/:id (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), updateCategory);

// DELETE /api/categories/:id (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteCategory);

export default router;
