import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeSyncService } from './exchange-sync.service';
import { ExchangeRegistry } from './exchange.registry';
import { ConnectionsService } from './connections.service';
import { ExchangeId } from '@workspace/shared-types/database';
import { ExchangeProvider } from './interfaces/exchange-provider.interface';

describe('ExchangeSyncService', () => {
  let service: ExchangeSyncService;
  let mockSupabase: any;
  let mockRegistry: jest.Mocked<ExchangeRegistry>;
  let mockConnectionsService: jest.Mocked<ConnectionsService>;

  const mockUserId = 'user-123';
  const mockConnectionId = 'conn-456';
  const mockPortfolioId = 'portfolio-789';

  beforeEach(async () => {
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    // Mock ExchangeRegistry
    mockRegistry = {
      register: jest.fn(),
      get: jest.fn(),
      getSupportedExchanges: jest.fn(),
    } as unknown as jest.Mocked<ExchangeRegistry>;

    // Mock ConnectionsService
    mockConnectionsService = {
      getDecryptedCredentials: jest.fn(),
    } as unknown as jest.Mocked<ConnectionsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeSyncService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabase },
        { provide: ExchangeRegistry, useValue: mockRegistry },
        { provide: ConnectionsService, useValue: mockConnectionsService },
      ],
    }).compile();

    service = module.get<ExchangeSyncService>(ExchangeSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncHoldings', () => {
    it('should return success with zero assets when no non-dust balances found', async () => {
      // Arrange
      mockConnectionsService.getDecryptedCredentials.mockResolvedValue({
        apiKey: 'key',
        apiSecret: 'secret',
        exchange: 'binance' as ExchangeId,
      });

      const mockProvider: Partial<ExchangeProvider> = {
        getName: () => 'binance',
        fetchBalances: jest.fn().mockResolvedValue([]),
      };
      mockRegistry.get.mockReturnValue(mockProvider as ExchangeProvider);

      // Act
      const result = await service.syncHoldings(mockUserId, mockConnectionId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.assetsSync).toBe(0);
      expect(result.syncedBalances).toHaveLength(0);
    });

    it('should sync balances for OKX with passphrase', async () => {
      // Arrange
      mockConnectionsService.getDecryptedCredentials.mockResolvedValue({
        apiKey: 'key',
        apiSecret: 'secret',
        exchange: 'okx' as ExchangeId,
        passphrase: 'my-passphrase',
      });

      const mockBalances = [
        { asset: 'BTC', free: '1', locked: '0', total: '1', usdValue: '50000' },
      ];

      const mockProvider: Partial<ExchangeProvider> = {
        getName: () => 'okx',
        fetchBalances: jest.fn().mockResolvedValue(mockBalances),
      };
      mockRegistry.get.mockReturnValue(mockProvider as ExchangeProvider);

      // Mock portfolio lookup
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: mockPortfolioId },
        error: null,
      });

      // Mock asset upsert
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'asset-id' },
        error: null,
      });

      // Mock transaction insert (no single call needed)
      mockSupabase.insert.mockReturnValueOnce({
        error: null,
      });

      // Mock connection update
      mockSupabase.update.mockReturnThis();
      mockSupabase.eq.mockReturnValue({ error: null });

      // Act - we verify the passphrase is passed correctly
      await service.syncHoldings(mockUserId, mockConnectionId, mockPortfolioId);

      // Assert
      expect(mockProvider.fetchBalances).toHaveBeenCalledWith(
        'key',
        'secret',
        'my-passphrase',
      );
    });

    it('should return error result on failure', async () => {
      // Arrange
      mockConnectionsService.getDecryptedCredentials.mockRejectedValue(
        new Error('Connection not found'),
      );

      // Act
      const result = await service.syncHoldings(mockUserId, mockConnectionId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection not found');
      expect(result.assetsSync).toBe(0);
    });
  });
});
