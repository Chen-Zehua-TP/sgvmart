import Stripe from 'stripe';
import { AppError } from '../middleware/errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
});

export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> => {
  try {
    // Stripe expects amount in cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata || {},
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw new AppError('Failed to create payment intent', 500);
  }
};

export const confirmPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent retrieval failed:', error);
    throw new AppError('Failed to retrieve payment intent', 500);
  }
};

export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return refund;
  } catch (error) {
    console.error('Stripe refund creation failed:', error);
    throw new AppError('Failed to create refund', 500);
  }
};

export const handleWebhook = async (
  rawBody: Buffer,
  signature: string
): Promise<Stripe.Event> => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    console.error('Stripe webhook verification failed:', error);
    throw new AppError('Webhook signature verification failed', 400);
  }
};
