import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getUserOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
      address: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
};

export const getOrderById = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
      address: true,
    },
  });

  return order;
};

export const createOrder = async (
  userId: string,
  addressId: string,
  paymentMethod: string
) => {
  // Get user cart
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  // Validate address
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new AppError('Address not found', 404);
  }

  // Validate stock for all items
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
    }
    if (!item.product.isActive) {
      throw new AppError(`Product ${item.product.name} is no longer available`, 400);
    }
  }

  // Calculate total
  const totalAmount = cart.items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  // Create order with items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        addressId,
        totalAmount,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        address: true,
      },
    });

    // Update product stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  return order;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  // Validate status
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status', 400);
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      },
      address: true,
    },
  });

  return updatedOrder;
};
