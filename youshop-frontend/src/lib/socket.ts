import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

type NotificationCallback = (notification: Notification) => void;
type OrderUpdateCallback = (data: { orderId: string; status: string }) => void;
type StockUpdateCallback = (data: { productId: string; stock: number }) => void;

class SocketService {
  private socket: Socket | null = null;
  private notificationCallbacks: NotificationCallback[] = [];
  private orderUpdateCallbacks: OrderUpdateCallback[] = [];
  private stockUpdateCallbacks: StockUpdateCallback[] = [];

  connect(token?: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: token ? { token } : undefined,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen for notifications
    this.socket.on('notification', (notification: Notification) => {
      this.notificationCallbacks.forEach((callback) => callback(notification));
    });

    // Listen for order updates
    this.socket.on('order:updated', (data: { orderId: string; status: string }) => {
      this.orderUpdateCallbacks.forEach((callback) => callback(data));
    });

    // Listen for stock updates
    this.socket.on('stock:updated', (data: { productId: string; stock: number }) => {
      this.stockUpdateCallbacks.forEach((callback) => callback(data));
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to notifications
  onNotification(callback: NotificationCallback): () => void {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Subscribe to order updates
  onOrderUpdate(callback: OrderUpdateCallback): () => void {
    this.orderUpdateCallbacks.push(callback);
    return () => {
      this.orderUpdateCallbacks = this.orderUpdateCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Subscribe to stock updates
  onStockUpdate(callback: StockUpdateCallback): () => void {
    this.stockUpdateCallbacks.push(callback);
    return () => {
      this.stockUpdateCallbacks = this.stockUpdateCallbacks.filter((cb) => cb !== callback);
    };
  }

  // Join a room (e.g., for specific order updates)
  joinRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('join', room);
    }
  }

  // Leave a room
  leaveRoom(room: string): void {
    if (this.socket) {
      this.socket.emit('leave', room);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Singleton instance
export const socketService = new SocketService();
