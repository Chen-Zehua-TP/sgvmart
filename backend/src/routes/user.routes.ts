import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getUserProfile,
  updateUserProfile,
  getAddresses,
  addAddress,
  modifyAddress,
  removeAddress,
} from '../controllers/user.controller';

const router = Router();

// Address routes (must come before /:id routes)
router.get('/addresses', authenticate, getAddresses);
router.post('/addresses', authenticate, addAddress);
router.put('/addresses/:id', authenticate, modifyAddress);
router.delete('/addresses/:id', authenticate, removeAddress);

// User profile routes
router.get('/:id', authenticate, getUserProfile);
router.put('/:id', authenticate, updateUserProfile);

export default router;
