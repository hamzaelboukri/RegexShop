import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
  let service: WebsocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsocketService],
    }).compile();

    service = module.get<WebsocketService>(WebsocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addConnection', () => {
    it('should add a new connection for a user', () => {
      service.addConnection('user-1', 'socket-1');
      expect(service.isUserConnected('user-1')).toBe(true);
    });

    it('should allow multiple connections per user', () => {
      service.addConnection('user-1', 'socket-1');
      service.addConnection('user-1', 'socket-2');
      
      const socketIds = service.getUserSocketIds('user-1');
      expect(socketIds).toHaveLength(2);
      expect(socketIds).toContain('socket-1');
      expect(socketIds).toContain('socket-2');
    });
  });

  describe('removeConnection', () => {
    it('should remove a connection', () => {
      service.addConnection('user-1', 'socket-1');
      service.addConnection('user-1', 'socket-2');
      
      service.removeConnection('user-1', 'socket-1');
      
      const socketIds = service.getUserSocketIds('user-1');
      expect(socketIds).toHaveLength(1);
      expect(socketIds).toContain('socket-2');
    });

    it('should remove user when last connection is removed', () => {
      service.addConnection('user-1', 'socket-1');
      service.removeConnection('user-1', 'socket-1');
      
      expect(service.isUserConnected('user-1')).toBe(false);
    });
  });

  describe('isUserConnected', () => {
    it('should return false for non-connected user', () => {
      expect(service.isUserConnected('non-existent')).toBe(false);
    });

    it('should return true for connected user', () => {
      service.addConnection('user-1', 'socket-1');
      expect(service.isUserConnected('user-1')).toBe(true);
    });
  });

  describe('getConnectedUsersCount', () => {
    it('should return 0 when no users connected', () => {
      expect(service.getConnectedUsersCount()).toBe(0);
    });

    it('should return correct count', () => {
      service.addConnection('user-1', 'socket-1');
      service.addConnection('user-2', 'socket-2');
      service.addConnection('user-1', 'socket-3'); // Same user, different socket
      
      expect(service.getConnectedUsersCount()).toBe(2);
    });
  });

  describe('getConnectionStats', () => {
    it('should return correct statistics', () => {
      service.addConnection('user-1', 'socket-1');
      service.addConnection('user-1', 'socket-2');
      service.addConnection('user-2', 'socket-3');
      
      const stats = service.getConnectionStats();
      
      expect(stats.totalUsers).toBe(2);
      expect(stats.totalConnections).toBe(3);
      expect(stats.users).toHaveLength(2);
    });
  });
});
