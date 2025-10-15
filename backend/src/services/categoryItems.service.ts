import prisma from '../config/database';

/**
 * Get all category items
 */
export const getAllCategoryItems = async () => {
  const categoryItems = await prisma.categoryItem.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { category: 'asc' },
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  });

  return categoryItems;
};

/**
 * Get items for a specific category
 */
export const getCategoryItems = async (category: string) => {
  const items = await prisma.categoryItem.findMany({
    where: {
      category: {
        equals: category,
        mode: 'insensitive',
      },
      isActive: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  });

  return items;
};

/**
 * Create a new category item (Admin only)
 */
export const createCategoryItem = async (data: {
  category: string;
  name: string;
  keywords?: string[];
  imageUrl?: string;
  description?: string;
  sortOrder?: number;
}) => {
  const categoryItem = await prisma.categoryItem.create({
    data: {
      category: data.category,
      name: data.name,
      keywords: data.keywords || [],
      imageUrl: data.imageUrl,
      description: data.description,
      sortOrder: data.sortOrder || 0,
      isActive: true,
    },
  });

  return categoryItem;
};

/**
 * Update a category item (Admin only)
 */
export const updateCategoryItem = async (
  id: string,
  data: {
    category?: string;
    name?: string;
    keywords?: string[];
    imageUrl?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) => {
  const categoryItem = await prisma.categoryItem.update({
    where: { id },
    data,
  });

  return categoryItem;
};

/**
 * Delete a category item (Admin only)
 */
export const deleteCategoryItem = async (id: string) => {
  const categoryItem = await prisma.categoryItem.delete({
    where: { id },
  });

  return categoryItem;
};
