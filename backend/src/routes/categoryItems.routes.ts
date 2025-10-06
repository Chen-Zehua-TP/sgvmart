import { Router } from 'express';
import { categoryItemsController } from '../controllers/categoryItems.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', categoryItemsController.getAllCategoryItems);
router.get('/:category', categoryItemsController.getCategoryItems);

// Admin routes - refresh category items
router.post('/:category/refresh', authenticate, categoryItemsController.refreshCategoryItems);

export default router;
