import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

/**
 * @route   POST /api/payment/create-intent
 * @desc    Create a payment intent for checkout
 * @access  Private
 */
router.post(
  '/create-intent',
  authenticate,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('orderId').optional().isString(),
  ],
  paymentController.createPaymentIntent
);

/**
 * @route   POST /api/payment/confirm
 * @desc    Confirm a payment after successful charge
 * @access  Private
 */
router.post(
  '/confirm',
  authenticate,
  [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('orderId').optional().isString(),
  ],
  paymentController.confirmPayment
);

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (with signature verification)
 */
router.post('/webhook', paymentController.handleWebhook);

export default router;
