import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotService } from './snapshot.service';
import { PortfoliosService } from './portfolios.service';

// Mock dependencies
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
};

const mockPortfoliosService = {
  findOne: jest.fn(),
};

describe('SnapshotService', () => {
  let service: SnapshotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotService,
        {
          provide: 'SUPABASE_CLIENT',
          useValue: mockSupabase,
        },
        {
          provide: PortfoliosService,
          useValue: mockPortfoliosService,
        },
      ],
    }).compile();

    service = module.get<SnapshotService>(SnapshotService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('captureSnapshot', () => {
    it('should capture a snapshot successfully', async () => {
      // Setup
      const userId = 'user-1';
      const portfolioId = 'pf-1';
      const mockPortfolio = {
        netWorth: 10000,
        totalCostBasis: 8000,
        providerStatus: 'synced',
        allocation: { cash: 100 },
        base_currency: 'USD',
      };

      mockPortfoliosService.findOne.mockResolvedValue({ data: mockPortfolio });
      mockSupabase.single.mockResolvedValue({
        data: { id: 'snap-1', net_worth: 10000 },
        error: null,
      });

      // Execute
      const result = await service.captureSnapshot(userId, portfolioId);

      // Verify
      expect(mockPortfoliosService.findOne).toHaveBeenCalledWith(
        userId,
        portfolioId,
        true,
      );
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_snapshots');
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          portfolio_id: portfolioId,
          user_id: userId,
          net_worth: 10000,
        }),
      );
      expect(result).toEqual({ id: 'snap-1', net_worth: 10000 });
    });

    it('should return null if portfolio not found', async () => {
      mockPortfoliosService.findOne.mockResolvedValue({ data: null });
      const result = await service.captureSnapshot('u1', 'p1');
      expect(result).toBeNull();
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it('should handle supabase error gracefully', async () => {
      mockPortfoliosService.findOne.mockResolvedValue({
        data: { netWorth: 100 },
      });
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'DB Error', code: '500' },
      });

      const result = await service.captureSnapshot('u1', 'p1');
      expect(result).toBeNull();
    });
  });

  describe('shouldCapture', () => {
    it('should return true if no previous snapshot', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });
      const result = await service.shouldCapture('p1');
      expect(result).toBe(true);
    });

    it('should return false if snapshot valid (1 hour old)', async () => {
      const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString();
      mockSupabase.single.mockResolvedValue({
        data: { timestamp: oneHourAgo },
        error: null,
      });

      const result = await service.shouldCapture('p1');
      expect(result).toBe(false);
    });

    it('should return true if snapshot stale (25 hours old)', async () => {
      const staleTime = new Date(
        Date.now() - 1000 * 60 * 60 * 25,
      ).toISOString();
      mockSupabase.single.mockResolvedValue({
        data: { timestamp: staleTime },
        error: null,
      });

      const result = await service.shouldCapture('p1');
      expect(result).toBe(true);
    });
  });
});
