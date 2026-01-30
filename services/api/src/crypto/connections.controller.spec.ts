import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';
import { ExchangeSyncService } from './exchange-sync.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthGuard } from '../portfolios/guards/auth.guard';

describe('ConnectionsController', () => {
  let controller: ConnectionsController;
  let mockConnectionsService: any;
  let mockExchangeSyncService: any;

  beforeEach(async () => {
    mockConnectionsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      validateConnection: jest.fn(),
      remove: jest.fn(),
    };

    mockExchangeSyncService = {
      syncHoldings: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionsController],
      providers: [
        { provide: ConnectionsService, useValue: mockConnectionsService },
        { provide: ExchangeSyncService, useValue: mockExchangeSyncService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ConnectionsController>(ConnectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('syncOne', () => {
    const mockUserId = 'user-123';
    const mockConnectionId = 'conn-456';
    const mockConnection = { id: mockConnectionId, lastSyncedAt: '2026-01-01' };

    it('should trigger sync and return updated connection', async () => {
      // Arrange
      mockExchangeSyncService.syncHoldings.mockResolvedValue({
        success: true,
        assetsSync: 5,
      });
      mockConnectionsService.findOne.mockResolvedValue(mockConnection);

      // Act
      const result = await controller.syncOne(mockUserId, mockConnectionId);

      // Assert
      expect(mockExchangeSyncService.syncHoldings).toHaveBeenCalledWith(
        mockUserId,
        mockConnectionId,
      );
      expect(mockConnectionsService.findOne).toHaveBeenCalledWith(
        mockUserId,
        mockConnectionId,
      );
      expect(result).toEqual({
        success: true,
        data: mockConnection,
        meta: { assetsSync: 5 },
      });
    });

    it('should throw error if sync fails', async () => {
      // Arrange
      mockExchangeSyncService.syncHoldings.mockResolvedValue({
        success: false,
        error: 'Sync failed reason',
      });

      // Act & Assert
      await expect(
        controller.syncOne(mockUserId, mockConnectionId),
      ).rejects.toThrow('Sync failed reason');
    });
  });
});
