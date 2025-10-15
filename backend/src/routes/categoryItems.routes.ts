import { Router } from 'express';
import { categoryItemsController } from '../controllers/categoryItems.controller';

const router = Router();

// Public routes
router.get('/', categoryItemsController.getAllCategoryItems);
router.get('/:category', categoryItemsController.getCategoryItems);

// Refresh category items
router.post('/:category/refresh', categoryItemsController.refreshCategoryItems);

export default router;
