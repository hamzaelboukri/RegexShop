import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthenticatedUser, JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        throw new WsException('Missing authentication token');
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      
      const user: AuthenticatedUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      // Attach user to socket data
      client.data.user = user;

      return true;
    } catch (error) {
      this.logger.error(`WebSocket authentication failed: ${(error as Error).message}`);
      throw new WsException('Invalid authentication token');
    }
  }

  private extractTokenFromSocket(socket: Socket): string | null {
    // Try to get token from handshake auth
    const authHeader = socket.handshake.auth?.token;
    if (authHeader) {
      return authHeader;
    }

    // Try to get token from query
    const queryToken = socket.handshake.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    // Try to get from headers (Authorization: Bearer xxx)
    const headerAuth = socket.handshake.headers?.authorization;
    if (headerAuth && headerAuth.startsWith('Bearer ')) {
      return headerAuth.substring(7);
    }

    return null;
  }
}
