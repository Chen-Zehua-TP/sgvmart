import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return categories;
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        where: {
          isActive: true,
        },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return category;
};

export const createCategory = async (data: any) => {
  const { name, description, slug, imageUrl } = data;

  // Check if slug already exists
  const existingCategory = await prisma.category.findUnique({
    where: { slug },
  });

  if (existingCategory) {
    throw new AppError('Category slug already exists', 400);
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      slug,
      imageUrl,
    },
  });

  return category;
};

export const updateCategory = async (id: string, data: any) => {
  const { name, description, slug, imageUrl } = data;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new AppError('Category not found', 404);
  }

  // Check if new slug is already taken
  if (slug && slug !== existingCategory.slug) {
    const slugTaken = await prisma.category.findUnique({
      where: { slug },
    });

    if (slugTaken) {
      throw new AppError('Category slug already exists', 400);
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(slug && { slug }),
      ...(imageUrl !== undefined && { imageUrl }),
    },
  });

  return category;
};

export const deleteCategory = async (id: string) => {
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has products
  if (category._count.products > 0) {
    throw new AppError('Cannot delete category with products', 400);
  }

  await prisma.category.delete({
    where: { id },
  });
};
