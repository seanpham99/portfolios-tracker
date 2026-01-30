import { Test, TestingModule } from '@nestjs/testing';
import { OkxService } from './okx.service';
import { ExchangeRegistry } from './exchange.registry';
import * as ccxt from 'ccxt';

// Mock CCXT
const mockFetchBalance = jest.fn();
const mockFetchTickers = jest.fn();

jest.mock('ccxt', () => {
  return {
    okx: jest.fn().mockImplementation(() => ({
      fetchBalance: mockFetchBalance,
      fetchTickers: mockFetchTickers,
    })),
    AuthenticationError: class extends Error {},
    RateLimitExceeded: class extends Error {},
    NetworkError: class extends Error {},
    ExchangeNotAvailable: class extends Error {},
    ExchangeError: class extends Error {},
  };
});

describe('OkxService', () => {
  let service: OkxService;
  let registry: ExchangeRegistry;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OkxService,
        {
          provide: ExchangeRegistry,
          useValue: {
            register: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OkxService>(OkxService);
    registry = module.get<ExchangeRegistry>(ExchangeRegistry);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register itself with registry on init', () => {
    service.onModuleInit();
    expect(registry.register).toHaveBeenCalledWith(service);
  });

  describe('validateKeys', () => {
    it('should return valid result when fetchBalance succeeds', async () => {
      mockFetchBalance.mockResolvedValue({});

      const result = await service.validateKeys('key', 'secret', 'passphrase');

      expect(result.valid).toBe(true);
      expect(result.permissions).toContain('read');
      expect(ccxt.okx).toHaveBeenCalledWith(
        expect.objectContaining({
          apiKey: 'key',
          secret: 'secret',
          password: 'passphrase',
        }),
      );
    });

    it('should return error result when passphrase is missing', async () => {
      const result = await service.validateKeys('key', 'secret');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Passphrase is required');
    });

    it('should return error result when fetchBalance fails', async () => {
      mockFetchBalance.mockRejectedValue(new ccxt.ExchangeError('Auth failed'));

      const result = await service.validateKeys('key', 'secret', 'passphrase');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Exchange error: Auth failed');
    });
  });

  describe('fetchBalances', () => {
    it('should fetch and map balances correctly', async () => {
      mockFetchBalance.mockResolvedValue({
        total: { BTC: 1, ETH: 10, USDT: 100, DUST: 0.0001 },
        free: { BTC: 0.5, ETH: 5, USDT: 50, DUST: 0.0001 },
        used: { BTC: 0.5, ETH: 5, USDT: 50, DUST: 0 },
      });

      mockFetchTickers.mockResolvedValue({
        'BTC/USDT': { last: 50000 },
        'ETH/USDT': { last: 3000 },
      });

      const balances = await service.fetchBalances(
        'key',
        'secret',
        'passphrase',
      );

      // Expect DUST to be filtered out (assuming 0.0001 DUST is < $1)
      // BTC: 1 * 50000 = $50000
      // ETH: 10 * 3000 = $30000
      // USDT: 100 * 1 = $100
      expect(balances).toHaveLength(3);
      expect(balances.find((b) => b.asset === 'BTC')).toBeDefined();
      expect(balances.find((b) => b.asset === 'ETH')).toBeDefined();
      expect(balances.find((b) => b.asset === 'USDT')).toBeDefined();
      expect(balances.find((b) => b.asset === 'DUST')).toBeUndefined();
    });

    it('should throw error if passphrase is missing', async () => {
      await expect(service.fetchBalances('key', 'secret')).rejects.toThrow(
        'Passphrase is required',
      );
    });
  });
});
