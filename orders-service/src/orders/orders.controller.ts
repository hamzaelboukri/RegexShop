import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, QueryOrdersDto } from '../dto';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles, Role } from '../auth/decorators';

interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Create a new order (Client)
   * POST /orders
   */
  @Post()
  @Roles(Role.CLIENT, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ordersService.createOrder(createOrderDto, user.userId);
  }

  /**
   * Get all orders with filtering (Admin only)
   * GET /orders?status=PENDING&page=1&limit=10
   */
  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() queryDto: QueryOrdersDto) {
    return this.ordersService.findAll(queryDto);
  }

  /**
   * Get current user's orders (Client)
   * GET /orders/my-orders
   */
  @Get('my-orders')
  @Roles(Role.CLIENT, Role.ADMIN)
  async getMyOrders(
    @CurrentUser() user: UserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.findUserOrders(user.userId, page, limit);
  }

  /**
   * Get order statistics (Admin)
   * GET /orders/statistics
   */
  @Get('statistics')
  @Roles(Role.ADMIN)
  async getStatistics() {
    return this.ordersService.getStatistics();
  }

  /**
   * Get order by order number
   * GET /orders/number/:orderNumber
   */
  @Get('number/:orderNumber')
  @Roles(Role.CLIENT, Role.ADMIN)
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Clients can only see their own orders
    const userId = user.role === Role.CLIENT ? user.userId : undefined;
    return this.ordersService.findByOrderNumber(orderNumber, userId);
  }

  /**
   * Get a single order by ID
   * GET /orders/:id
   */
  @Get(':id')
  @Roles(Role.CLIENT, Role.ADMIN)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    // Clients can only see their own orders
    const userId = user.role === Role.CLIENT ? user.userId : undefined;
    return this.ordersService.findOne(id, userId);
  }

  /**
   * Update order status (Admin only)
   * PATCH /orders/:id/status
   */
  @Patch(':id/status')
  @Roles(Role.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  /**
   * Cancel an order (Client - own orders only)
   * POST /orders/:id/cancel
   */
  @Post(':id/cancel')
  @Roles(Role.CLIENT, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.ordersService.cancelOrder(id, user.userId);
  }

  /**
   * Delete an order (Admin only - for testing)
   * DELETE /orders/:id
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
