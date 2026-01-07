import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateInventoryDto, UpdateInventoryDto, UpdateStockDto, ReserveStockDto, ReleaseStockDto } from '../dto';
import { MovementType } from '../../generated/prisma';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new inventory item
   */
  async create(createInventoryDto: CreateInventoryDto) {
    const { sku, productId, name, total, lowStockThreshold = 10 } = createInventoryDto;

    // Check if SKU already exists
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { sku },
    });

    if (existing) {
      throw new ConflictException(`Inventory item with SKU ${sku} already exists`);
    }

    const inventoryItem = await this.prisma.inventoryItem.create({
      data: {
        sku,
        productId,
        name,
        total,
        available: total, // Initially all stock is available
        reserved: 0,
        lowStockThreshold,
      },
    });

    // Record stock movement
    if (total > 0) {
      await this.createStockMovement(
        inventoryItem.id,
        MovementType.IN,
        total,
        'Initial stock',
        null,
        null,
      );
    }

    this.logger.log(`Created inventory item: ${sku} with total stock: ${total}`);
    return inventoryItem;
  }

  /**
   * Find all inventory items with pagination
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryItem.count(),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find inventory item by ID
   */
  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found`);
    }

    return item;
  }

  /**
   * Find inventory item by SKU
   */
  async findBySku(sku: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { sku },
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with SKU ${sku} not found`);
    }

    return item;
  }

  /**
   * Find inventory item by Product ID
   */
  async findByProductId(productId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { productId },
    });

    return items;
  }

  /**
   * Update inventory item metadata (name, threshold)
   */
  async update(id: string, updateInventoryDto: UpdateInventoryDto) {
    await this.findOne(id); // Ensure it exists

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: updateInventoryDto,
    });

    this.logger.log(`Updated inventory item: ${id}`);
    return updated;
  }

  /**
   * Delete inventory item
   */
  async remove(id: string) {
    const item = await this.findOne(id);

    if (item.reserved > 0) {
      throw new BadRequestException('Cannot delete inventory item with reserved stock');
    }

    await this.prisma.inventoryItem.delete({
      where: { id },
    });

    this.logger.log(`Deleted inventory item: ${id}`);
    return { message: 'Inventory item deleted successfully' };
  }

  /**
   * Add or subtract stock (Admin operation)
   */
  async updateStock(id: string, updateStockDto: UpdateStockDto) {
    const { quantity, reason, performedBy } = updateStockDto;
    const item = await this.findOne(id);

    const newTotal = item.total + quantity;
    const newAvailable = item.available + quantity;

    if (newTotal < 0) {
      throw new BadRequestException('Cannot reduce stock below zero');
    }

    if (newAvailable < 0) {
      throw new BadRequestException('Cannot reduce available stock below reserved quantity');
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        total: newTotal,
        available: newAvailable,
      },
    });

    // Record stock movement
    await this.createStockMovement(
      id,
      quantity > 0 ? MovementType.IN : MovementType.OUT,
      Math.abs(quantity),
      reason || (quantity > 0 ? 'Stock added' : 'Stock removed'),
      null,
      performedBy || null,
    );

    this.logger.log(`Updated stock for ${item.sku}: ${quantity > 0 ? '+' : ''}${quantity}`);
    return updated;
  }

  /**
   * Reserve stock for an order
   */
  async reserveStock(id: string, reserveStockDto: ReserveStockDto) {
    const { quantity, orderId, performedBy } = reserveStockDto;
    const item = await this.findOne(id);

    if (item.available < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.available}, Requested: ${quantity}`,
      );
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        available: item.available - quantity,
        reserved: item.reserved + quantity,
      },
    });

    // Record stock movement
    await this.createStockMovement(
      id,
      MovementType.RESERVE,
      quantity,
      `Reserved for order ${orderId}`,
      orderId,
      performedBy || null,
    );

    this.logger.log(`Reserved ${quantity} units of ${item.sku} for order ${orderId}`);
    return updated;
  }

  /**
   * Release reserved stock (e.g., order cancelled)
   */
  async releaseStock(id: string, releaseStockDto: ReleaseStockDto) {
    const { quantity, orderId, reason, performedBy } = releaseStockDto;
    const item = await this.findOne(id);

    if (item.reserved < quantity) {
      throw new BadRequestException(
        `Cannot release more than reserved. Reserved: ${item.reserved}, Requested: ${quantity}`,
      );
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        available: item.available + quantity,
        reserved: item.reserved - quantity,
      },
    });

    // Record stock movement
    await this.createStockMovement(
      id,
      MovementType.RELEASE,
      quantity,
      reason || `Released from order ${orderId}`,
      orderId,
      performedBy || null,
    );

    this.logger.log(`Released ${quantity} units of ${item.sku} from order ${orderId}`);
    return updated;
  }

  /**
   * Confirm order and remove reserved stock from total
   */
  async confirmOrder(id: string, orderId: string, quantity: number, performedBy?: string) {
    const item = await this.findOne(id);

    if (item.reserved < quantity) {
      throw new BadRequestException('Insufficient reserved stock for order confirmation');
    }

    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: {
        reserved: item.reserved - quantity,
        total: item.total - quantity,
      },
    });

    // Record stock movement
    await this.createStockMovement(
      id,
      MovementType.OUT,
      quantity,
      `Order ${orderId} confirmed`,
      orderId,
      performedBy || null,
    );

    this.logger.log(`Confirmed order ${orderId}: Removed ${quantity} units of ${item.sku}`);
    return updated;
  }

  /**
   * Get low stock items
   */
  async getLowStockItems() {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        available: {
          lte: this.prisma.inventoryItem.fields.lowStockThreshold,
        },
      },
      orderBy: { available: 'asc' },
    });

    return items;
  }

  /**
   * Get stock movements for an inventory item
   */
  async getStockMovements(id: string, limit: number = 50) {
    await this.findOne(id); // Ensure item exists

    const movements = await this.prisma.stockMovement.findMany({
      where: { inventoryItemId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return movements;
  }

  /**
   * Get stock movements by order ID
   */
  async getMovementsByOrderId(orderId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return movements;
  }

  /**
   * Create a stock movement record
   */
  private async createStockMovement(
    inventoryItemId: string,
    type: MovementType,
    quantity: number,
    reason: string,
    orderId: string | null,
    performedBy: string | null,
  ) {
    return this.prisma.stockMovement.create({
      data: {
        inventoryItemId,
        type,
        quantity,
        reason,
        orderId,
        performedBy,
      },
    });
  }
}
