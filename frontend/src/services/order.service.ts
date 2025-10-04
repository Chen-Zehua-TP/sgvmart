import api from './api';

export const orderService = {
  async getUserOrders() {
    const response = await api.get('/orders');
    return response.data.orders;
  },

  async getOrderById(id: string) {
    const response = await api.get(`/orders/${id}`);
    return response.data.order;
  },

  async createOrder(addressId: string, paymentMethod: string) {
    const response = await api.post('/orders', { addressId, paymentMethod });
    return response.data.order;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data.order;
  },
};
