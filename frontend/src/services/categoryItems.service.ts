import api from './api';

export interface CategoryItem {
  id: string;
  category: string;
  name: string;
  keywords: string[];
  imageUrl?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItemsResponse {
  success: boolean;
  data: Record<string, CategoryItem[]>;
}

export const categoryItemsService = {
  getAllCategoryItems: async (): Promise<Record<string, CategoryItem[]>> => {
    const response = await api.get<CategoryItemsResponse>('/category-items');
    return response.data.data;
  },

  getCategoryItems: async (category: string, refresh = false): Promise<CategoryItem[]> => {
    const response = await api.get<{ success: boolean; data: CategoryItem[] }>(
      `/category-items/${encodeURIComponent(category)}`,
      { params: { refresh } }
    );
    return response.data.data;
  },

  refreshCategoryItems: async (category: string): Promise<CategoryItem[]> => {
    const response = await api.post<{ success: boolean; data: CategoryItem[] }>(
      `/category-items/${encodeURIComponent(category)}/refresh`
    );
    return response.data.data;
  },
};
