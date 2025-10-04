import api from './api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data.cart;
  },

  async addToCart(productId: string, quantity: number) {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data.cartItem;
  },

  async updateCartItem(itemId: string, quantity: number) {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data.cartItem;
  },

  async removeFromCart(itemId: string) {
    await api.delete(`/cart/items/${itemId}`);
  },

  async clearCart() {
    await api.delete('/cart');
  },
};
