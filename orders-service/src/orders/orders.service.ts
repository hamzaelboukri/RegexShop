import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrdersDto } from '../dto';
import { OrderStatus, PaymentStatus } from '../enums';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new order
   */
  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    this.logger.log(`Creating order for user: ${userId}`);

    if (!createOrderDto.items || createOrderDto.items.length === 0) {   
      throw new BadRequestException('Order must contain at least one item');
    }

    // Calculate prices
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const taxRate = createOrderDto.taxRate || 0.20; // Default 20% tax
    const taxAmount = subtotal * taxRate;
    const shippingCost = createOrderDto.shippingCost || 0;
    const total = subtotal + taxAmount + shippingCost;

    // Create order with items
    const order = await this.prisma.order.create({
      data: {
        userId,
        status: 'PENDING' as any,
        paymentStatus: 'UNPAID' as any,
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        shippingAddress: createOrderDto.shippingAddress as any,
        billingAddress: createOrderDto.billingAddress as any,
        paymentMethod: createOrderDto.paymentMethod,
        notes: createOrderDto.notes,
        items: {
          create: createOrderDto.items.map((item) => ({
            productId: item.productId,
            sku: item.sku,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice.toFixed(2)),
            totalPrice: parseFloat((item.unitPrice * item.quantity).toFixed(2)),
          })),
        },
      } as any,
      include: {
        items: true,
      },
    });

    this.logger.log(`Order created successfully: ${order.id}`);
    
    // TODO: Emit event to inventory service to reserve stock
    // This would be done via Kafka in a real microservices setup
    
    return order;
  }

  /**
   * Get all orders with filtering and pagination
   */
  async findAll(queryDto: QueryOrdersDto) {
    const { status, paymentStatus, userId, orderNumber, page = 1, limit = 10 } = queryDto;

    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (userId) where.userId = userId;
    if (orderNumber) where.orderNumber = orderNumber;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get orders for a specific user
   */
  async findUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single order by ID
   */
  async findOne(id: string, userId?: string) {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findUnique({
      where,
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Get order by order number
   */
  async findByOrderNumber(orderNumber: string, userId?: string) {
    const where: any = { orderNumber };
    if (userId) {
      where.userId = userId;
    }

    const order = await this.prisma.order.findUnique({
      where,
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Validate status transitions
    if (updateStatusDto.status) {
      this.validateStatusTransition(order.status as OrderStatus, updateStatusDto.status);
    }

    const updateData: any = {};

    if (updateStatusDto.status) {
      updateData.status = updateStatusDto.status;
      
      // Set timestamps based on status
      if (updateStatusDto.status === OrderStatus.CANCELLED) {
        updateData.cancelledAt = new Date();
      } else if (updateStatusDto.status === OrderStatus.DELIVERED) {
        updateData.completedAt = new Date();
      }
    }

    if (updateStatusDto.paymentStatus) {
      updateData.paymentStatus = updateStatusDto.paymentStatus;
      
      if (updateStatusDto.paymentStatus === PaymentStatus.PAID) {
        updateData.paidAt = new Date();
        // Auto-confirm order when paid
        if (!updateStatusDto.status) {
          updateData.status = OrderStatus.CONFIRMED;
        }
      }
    }

    if (updateStatusDto.notes) {
      updateData.notes = updateStatusDto.notes;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
      },
    });

    this.logger.log(`Order ${id} status updated to ${updateStatusDto.status || 'unchanged'}`);
    
    // TODO: Emit events based on status changes
    // - If CANCELLED or REFUNDED: emit event to release reserved stock
    // - If CONFIRMED: emit event to deduct stock
    
    return updatedOrder;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.userId !== userId) {
      throw new BadRequestException('You can only cancel your own orders');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException(
        `Cannot cancel order with status ${order.status}`,
      );
    }

    const cancelledOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: {
        items: true,
      },
    });

    this.logger.log(`Order ${id} cancelled by user ${userId}`);
    
    // TODO: Emit event to release reserved stock
    
    return cancelledOrder;
  }

  /**
   * Delete an order (admin only, for testing purposes)
   */
  async remove(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.prisma.order.delete({
      where: { id },
    });

    this.logger.log(`Order ${id} deleted`);
    
    return { message: 'Order deleted successfully' };
  }

  /**
   * Get order statistics (admin)
   */
  async getStatistics() {
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      this.prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      this.prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
      this.prisma.order.aggregate({
        where: {
          paymentStatus: 'PAID' as any,
          status: { not: OrderStatus.REFUNDED },
        },
        _sum: {
          subtotal: true,
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum?.subtotal || 0,
    };
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus];
    
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
