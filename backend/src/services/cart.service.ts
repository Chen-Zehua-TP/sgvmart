import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              stock: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                stock: true,
              },
            },
          },
        },
      },
    });
  }

  // Calculate total
  const total = cart.items.reduce((sum, item) => {
    const itemAny = item as any;
    if (itemAny.isExternal && itemAny.externalProductPrice) {
      return sum + Number(itemAny.externalProductPrice) * item.quantity;
    } else if (item.product) {
      return sum + Number(item.product.price) * item.quantity;
    }
    return sum;
  }, 0);

  return {
    ...cart,
    total,
  };
};

export const addToCart = async (
  userId: string,
  productId: string,
  quantity: number
) => {
  // Check if product exists and has enough stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (!product.isActive) {
    throw new AppError('Product is not available', 400);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Check if item already in cart (for regular products)
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    } as any,
  });

  let cartItem;

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      throw new AppError('Insufficient stock', 400);
    }

    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
          },
        },
      },
    });
  } else {
    // Create new cart item
    cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            stock: true,
          },
        },
      },
    });
  }

  return cartItem;
};

export const updateCartItem = async (
  userId: string,
  cartItemId: string,
  quantity: number
) => {
  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Get cart item
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      product: true,
    },
  });

  if (!cartItem || cartItem.cartId !== cart.id) {
    throw new AppError('Cart item not found', 404);
  }

  // Check stock (only for regular products)
  if (!(cartItem as any).isExternal && cartItem.product) {
    if (cartItem.product.stock < quantity) {
      throw new AppError('Insufficient stock', 400);
    }
  }

  const updatedItem = await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stock: true,
        },
      },
    },
  });

  return updatedItem;
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  // Get cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  // Get cart item
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem || cartItem.cartId !== cart.id) {
    throw new AppError('Cart item not found', 404);
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId },
  });
};

export const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
};

export const addExternalProductToCart = async (
  userId: string,
  productName: string,
  productUrl: string,
  productPrice: number,
  productImageUrl: string,
  quantity: number
) => {
  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // Create cart item for external product
  const cartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      quantity,
      isExternal: true,
      externalProductName: productName,
      externalProductUrl: productUrl,
      externalProductPrice: productPrice,
      externalProductImageUrl: productImageUrl,
    } as any,
  });

  return cartItem;
};
