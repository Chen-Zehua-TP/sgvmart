import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface ProductFilters {
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getAllProducts = async (filters: ProductFilters) => {
  const { categoryId, search, page = 1, limit = 10 } = filters;

  const where: any = {
    isActive: true,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return product;
};

export const createProduct = async (data: any) => {
  const { name, description, price, stock, imageUrl, categoryId } = data;

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return product;
};

export const updateProduct = async (id: string, data: any) => {
  const { name, description, price, stock, imageUrl, categoryId, isActive } = data;

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new AppError('Product not found', 404);
  }

  // Check if category exists if being updated
  if (categoryId && categoryId !== existingProduct.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(categoryId && { categoryId }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return product;
};

export const deleteProduct = async (id: string) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Soft delete by setting isActive to false
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
};
