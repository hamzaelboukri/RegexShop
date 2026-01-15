import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { AuthenticatedUser, JwtPayload } from '../auth/strategies/jwt.strategy';
import { WebsocketService } from './websocket.service';

export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly websocketService: WebsocketService,
  ) {}

  afterInit(): void {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const user = await this.authenticateClient(client);
      
      // Join user-specific room
      await client.join(`user:${user.id}`);
      
      // Join role-specific room (for admin alerts)
      await client.join(`role:${user.role}`);
      
      // Store user info in socket data
      client.data.user = user;
      
      // Track connection
      this.websocketService.addConnection(user.id, client.id);
      
      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
      
      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId: user.id,
        socketId: client.id,
      });
    } catch (error) {
      this.logger.error(`Connection rejected: ${(error as Error).message}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const user = client.data.user as AuthenticatedUser | undefined;
    
    if (user) {
      this.websocketService.removeConnection(user.id, client.id);
      this.logger.log(`Client disconnected: ${client.id} (User: ${user.id})`);
    } else {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ): { event: string; subscribed: boolean; channel: string } {
    const user = client.data.user as AuthenticatedUser;
    
    // Only allow subscribing to own channels or admin channels
    const allowedChannels = [`user:${user.id}`, `role:${user.role}`];
    
    if (user.role === 'admin') {
      allowedChannels.push('admin:alerts', 'stock:alerts');
    }

    if (!allowedChannels.includes(data.channel)) {
      throw new WsException('Unauthorized channel subscription');
    }

    client.join(data.channel);
    this.logger.log(`Client ${client.id} subscribed to ${data.channel}`);

    return {
      event: 'subscribed',
      subscribed: true,
      channel: data.channel,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ): { event: string; unsubscribed: boolean; channel: string } {
    client.leave(data.channel);
    this.logger.log(`Client ${client.id} unsubscribed from ${data.channel}`);

    return {
      event: 'unsubscribed',
      unsubscribed: true,
      channel: data.channel,
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('ping')
  handlePing(): { event: string; timestamp: string } {
    return {
      event: 'pong',
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ): Promise<{ event: string; success: boolean; notificationId: string }> {
    const user = client.data.user as AuthenticatedUser;
    
    // This will be handled by the notification service
    this.logger.log(`User ${user.id} marking notification ${data.notificationId} as read`);
    
    return {
      event: 'marked_read',
      success: true,
      notificationId: data.notificationId,
    };
  }

  /**
   * Send notification to a specific user
   */
  sendToUser(userId: string, notification: NotificationPayload): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Notification sent to user ${userId}: ${notification.type}`);
  }

  /**
   * Send notification to a specific role
   */
  sendToRole(role: string, notification: NotificationPayload): void {
    this.server.to(`role:${role}`).emit('notification', notification);
    this.logger.log(`Notification sent to role ${role}: ${notification.type}`);
  }

  /**
   * Send alert to all admins
   */
  sendAdminAlert(notification: NotificationPayload): void {
    this.server.to('admin:alerts').emit('admin_alert', notification);
    this.server.to('role:admin').emit('admin_alert', notification);
    this.logger.log(`Admin alert sent: ${notification.type}`);
  }

  /**
   * Send stock alert to admins
   */
  sendStockAlert(notification: NotificationPayload): void {
    this.server.to('stock:alerts').emit('stock_alert', notification);
    this.server.to('role:admin').emit('stock_alert', notification);
    this.logger.log(`Stock alert sent: ${notification.type}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(notification: NotificationPayload): void {
    this.server.emit('broadcast', notification);
    this.logger.log(`Broadcast sent: ${notification.type}`);
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.websocketService.isUserConnected(userId);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.websocketService.getConnectedUsersCount();
  }

  private async authenticateClient(client: Socket): Promise<AuthenticatedUser> {
    // Try multiple ways to get the token
    let token: string | null = null;

    // 1. From auth object
    if (client.handshake.auth?.token) {
      token = client.handshake.auth.token;
    }
    
    // 2. From query string
    if (!token && client.handshake.query?.token) {
      token = client.handshake.query.token as string;
    }
    
    // 3. From Authorization header
    if (!token && client.handshake.headers?.authorization) {
      const authHeader = client.handshake.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new WsException('No authentication token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    } catch {
      throw new WsException('Invalid authentication token');
    }
  }
}
