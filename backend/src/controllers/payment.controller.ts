import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import * as stripeService from '../services/stripe.service';
import prisma from '../config/database';

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    // Create payment intent
    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      'usd',
      {
        userId: req.user.id,
        orderId: orderId || '',
      }
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

export const confirmPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      throw new AppError('Payment intent ID is required', 400);
    }

    // Verify payment intent
    const paymentIntent = await stripeService.confirmPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new AppError('Payment not completed', 400);
    }

    // Update order payment status if orderId is provided
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
        },
      });
    }

    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

export const handleWebhook = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      throw new AppError('No signature provided', 400);
    }

    const event = await stripeService.handleWebhook(req.rawBody, signature);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        
        // Update order status if metadata contains orderId
        if (paymentIntent.metadata?.orderId) {
          await prisma.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
            },
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        
        // Update order status if metadata contains orderId
        if (paymentIntent.metadata?.orderId) {
          await prisma.order.update({
            where: { id: paymentIntent.metadata.orderId },
            data: {
              paymentStatus: 'FAILED',
            },
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
