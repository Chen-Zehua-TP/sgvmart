import api from './api';

export const productService = {
  async getAll(params?: { categoryId?: string; search?: string; page?: number; limit?: number }) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/products/${id}`);
    return response.data.product;
  },

  async create(data: any) {
    const response = await api.post('/products', data);
    return response.data.product;
  },

  async update(id: string, data: any) {
    const response = await api.put(`/products/${id}`, data);
    return response.data.product;
  },

  async delete(id: string) {
    await api.delete(`/products/${id}`);
  },
};

export const categoryService = {
  async getAll() {
    const response = await api.get('/categories');
    return response.data.categories;
  },

  async getById(id: string) {
    const response = await api.get(`/categories/${id}`);
    return response.data.category;
  },
};
