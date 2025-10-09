import api from './api';

export const paymentService = {
  async createPaymentIntent(amount: number, orderId?: string) {
    const response = await api.post('/payment/create-intent', {
      amount,
      orderId,
    });
    return response.data;
  },

  async confirmPayment(paymentIntentId: string, orderId?: string) {
    const response = await api.post('/payment/confirm', {
      paymentIntentId,
      orderId,
    });
    return response.data;
  },
};
