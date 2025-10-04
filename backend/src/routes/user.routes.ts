import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller';

const router = Router();

// GET /api/users/:id
router.get('/:id', authenticate, getUserProfile);

// PUT /api/users/:id
router.put('/:id', authenticate, updateUserProfile);

export default router;
