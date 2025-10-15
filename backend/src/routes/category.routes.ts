import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';

const router = Router();

// GET /api/categories
router.get('/', getAllCategories);

// GET /api/categories/:id
router.get('/:id', getCategoryById);

// POST /api/categories
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('slug').trim().notEmpty().withMessage('Slug is required'),
  ],
  createCategory
);

// PUT /api/categories/:id
router.put('/:id', updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', deleteCategory);

export default router;
