import { Injectable, Logger } from '@nestjs/common';

interface UserConnections {
  socketIds: Set<string>;
  connectedAt: Date;
  lastActivity: Date;
}

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);
  private readonly userConnections: Map<string, UserConnections> = new Map();

  /**
   * Add a new connection for a user
   */
  addConnection(userId: string, socketId: string): void {
    let connections = this.userConnections.get(userId);

    if (!connections) {
      connections = {
        socketIds: new Set(),
        connectedAt: new Date(),
        lastActivity: new Date(),
      };
      this.userConnections.set(userId, connections);
    }

    connections.socketIds.add(socketId);
    connections.lastActivity = new Date();

    this.logger.debug(
      `User ${userId} connection added. Total connections: ${connections.socketIds.size}`,
    );
  }

  /**
   * Remove a connection for a user
   */
  removeConnection(userId: string, socketId: string): void {
    const connections = this.userConnections.get(userId);

    if (connections) {
      connections.socketIds.delete(socketId);

      if (connections.socketIds.size === 0) {
        this.userConnections.delete(userId);
        this.logger.debug(`User ${userId} fully disconnected`);
      } else {
        this.logger.debug(
          `User ${userId} connection removed. Remaining: ${connections.socketIds.size}`,
        );
      }
    }
  }

  /**
   * Check if a user is currently connected
   */
  isUserConnected(userId: string): boolean {
    const connections = this.userConnections.get(userId);
    return connections !== undefined && connections.socketIds.size > 0;
  }

  /**
   * Get all socket IDs for a user
   */
  getUserSocketIds(userId: string): string[] {
    const connections = this.userConnections.get(userId);
    return connections ? Array.from(connections.socketIds) : [];
  }

  /**
   * Get the count of connected users
   */
  getConnectedUsersCount(): number {
    return this.userConnections.size;
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.userConnections.keys());
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalUsers: number;
    totalConnections: number;
    users: Array<{ userId: string; connections: number; connectedAt: Date }>;
  } {
    const users: Array<{ userId: string; connections: number; connectedAt: Date }> = [];
    let totalConnections = 0;

    this.userConnections.forEach((connections, userId) => {
      const connectionCount = connections.socketIds.size;
      totalConnections += connectionCount;
      users.push({
        userId,
        connections: connectionCount,
        connectedAt: connections.connectedAt,
      });
    });

    return {
      totalUsers: this.userConnections.size,
      totalConnections,
      users,
    };
  }

  /**
   * Update user's last activity timestamp
   */
  updateActivity(userId: string): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.lastActivity = new Date();
    }
  }

  /**
   * Clean up stale connections (connections with no activity for given duration)
   */
  cleanupStaleConnections(maxInactivityMs: number = 3600000): string[] {
    const now = new Date();
    const staleUsers: string[] = [];

    this.userConnections.forEach((connections, userId) => {
      const inactivityDuration = now.getTime() - connections.lastActivity.getTime();
      if (inactivityDuration > maxInactivityMs) {
        staleUsers.push(userId);
      }
    });

    staleUsers.forEach((userId) => {
      this.userConnections.delete(userId);
      this.logger.log(`Cleaned up stale connection for user ${userId}`);
    });

    return staleUsers;
  }
}
