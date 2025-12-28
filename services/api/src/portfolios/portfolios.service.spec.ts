import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { Portfolio } from './portfolio.entity';
import { CacheService } from '../cache';

// Mock portfolio data
const mockUserId = 'user-123';
const mockPortfolio: Portfolio = {
  id: 'portfolio-1',
  user_id: mockUserId,
  name: 'My Portfolio',
  base_currency: 'USD',
  description: 'Test portfolio',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
};

// Mock Cache service
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  invalidatePortfolio: jest.fn(),
};

describe('PortfoliosService', () => {
  let service: PortfoliosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfoliosService,
        {
          provide: 'SUPABASE_CLIENT',
          useValue: mockSupabaseClient,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<PortfoliosService>(PortfoliosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreatePortfolioDto = {
      name: 'My Portfolio',
      base_currency: 'USD',
      description: 'Test portfolio',
    };

    it('should create a portfolio successfully', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      const result = await service.create(mockUserId, createDto);

      expect(result).toEqual(mockPortfolio);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: createDto.name,
        base_currency: createDto.base_currency,
        description: createDto.description,
      });
      expect(mockCacheService.del).toHaveBeenCalledWith(`portfolios:${mockUserId}`);
    });

    it('should throw ConflictException for duplicate name', async () => {
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key' },
      });

      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      mockInsert.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      await expect(service.create(mockUserId, createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return cached portfolios if available', async () => {
      const mockPortfolios = [mockPortfolio];
      mockCacheService.get.mockResolvedValue(mockPortfolios);

      const result = await service.findAll(mockUserId);
      
      expect(result).toEqual(mockPortfolios);
      expect(mockCacheService.get).toHaveBeenCalledWith(`portfolios:${mockUserId}`);
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return all portfolios for user from DB and cache them', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const mockPortfolios = [mockPortfolio];
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockResolvedValue({
        data: mockPortfolios,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      });

      mockSelect.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ order: mockOrder });

      const result = await service.findAll(mockUserId);

      expect(result).toEqual(mockPortfolios);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
      expect(mockCacheService.set).toHaveBeenCalledWith(`portfolios:${mockUserId}`, mockPortfolios);
    });
  });

  describe('findOne', () => {
    it('should return a portfolio by id', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq1,
        single: mockSingle,
      });

      mockSelect.mockReturnValue({ eq: mockEq1 });
      mockEq1.mockReturnValue({ eq: mockEq2 });
      mockEq2.mockReturnValue({ single: mockSingle });

      const result = await service.findOne(mockUserId, mockPortfolio.id);

      expect(result).toEqual(mockPortfolio);
    });

    it('should throw NotFoundException when portfolio not found', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq1 = jest.fn().mockReturnThis();
      const mockEq2 = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq1,
        single: mockSingle,
      });

      mockSelect.mockReturnValue({ eq: mockEq1 });
      mockEq1.mockReturnValue({ eq: mockEq2 });
      mockEq2.mockReturnValue({ single: mockSingle });

      await expect(
        service.findOne(mockUserId, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdatePortfolioDto = {
      name: 'Updated Portfolio',
    };

    it('should update a portfolio successfully', async () => {
      const updatedPortfolio = { ...mockPortfolio, name: 'Updated Portfolio' };

      // Mock findOne first
      const mockSelectFind = jest.fn().mockReturnThis();
      const mockEqFind1 = jest.fn().mockReturnThis();
      const mockEqFind2 = jest.fn().mockReturnThis();
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      // Mock update
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEqUpdate1 = jest.fn().mockReturnThis();
      const mockEqUpdate2 = jest.fn().mockReturnThis();
      const mockSelectUpdate = jest.fn().mockReturnThis();
      const mockSingleUpdate = jest.fn().mockResolvedValue({
        data: updatedPortfolio,
        error: null,
      });

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // findOne call
          mockSelectFind.mockReturnValue({ eq: mockEqFind1 });
          mockEqFind1.mockReturnValue({ eq: mockEqFind2 });
          mockEqFind2.mockReturnValue({ single: mockSingleFind });
          return { select: mockSelectFind };
        } else {
          // update call
          mockUpdate.mockReturnValue({ eq: mockEqUpdate1 });
          mockEqUpdate1.mockReturnValue({ eq: mockEqUpdate2 });
          mockEqUpdate2.mockReturnValue({ select: mockSelectUpdate });
          mockSelectUpdate.mockReturnValue({ single: mockSingleUpdate });
          return { update: mockUpdate };
        }
      });

      const result = await service.update(
        mockUserId,
        mockPortfolio.id,
        updateDto,
      );

      expect(result).toEqual(updatedPortfolio);
      expect(mockCacheService.invalidatePortfolio).toHaveBeenCalledWith(mockUserId, mockPortfolio.id);
    });
  });

  describe('remove', () => {
    it('should delete a portfolio successfully', async () => {
      // Mock findOne first
      const mockSelectFind = jest.fn().mockReturnThis();
      const mockEqFind1 = jest.fn().mockReturnThis();
      const mockEqFind2 = jest.fn().mockReturnThis();
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      // Mock delete
      const mockDelete = jest.fn().mockReturnThis();
      const mockEqDelete1 = jest.fn().mockReturnThis();
      const mockEqDelete2 = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // findOne call
          mockSelectFind.mockReturnValue({ eq: mockEqFind1 });
          mockEqFind1.mockReturnValue({ eq: mockEqFind2 });
          mockEqFind2.mockReturnValue({ single: mockSingleFind });
          return { select: mockSelectFind };
        } else {
          // delete call
          mockDelete.mockReturnValue({ eq: mockEqDelete1 });
          mockEqDelete1.mockReturnValue({ eq: mockEqDelete2 });
          return { delete: mockDelete };
        }
      });

      await expect(
        service.remove(mockUserId, mockPortfolio.id),
      ).resolves.toBeUndefined();
      
      expect(mockCacheService.invalidatePortfolio).toHaveBeenCalledWith(mockUserId, mockPortfolio.id);
    });

    it('should throw NotFoundException when portfolio to delete is not found', async () => {
      const mockSelectFind = jest.fn().mockReturnThis();
      const mockEqFind1 = jest.fn().mockReturnThis();
      const mockEqFind2 = jest.fn().mockReturnThis();
      const mockSingleFind = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelectFind,
      });
      mockSelectFind.mockReturnValue({ eq: mockEqFind1 });
      mockEqFind1.mockReturnValue({ eq: mockEqFind2 });
      mockEqFind2.mockReturnValue({ single: mockSingleFind });

      await expect(
        service.remove(mockUserId, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
    });


  describe('getHoldings', () => {
    it('should aggregate holdings from transactions correctly', async () => {
      mockCacheService.get.mockResolvedValue(null); // No cache
      
      // Mock transactions with joined data
      const mockTransactions = [
        {
          asset_id: 'asset-1',
          quantity: 10,
          price: 100,
          type: 'BUY',
          assets: { id: 'asset-1', symbol: 'AAPL', name_en: 'Apple', asset_class: 'US Equity', market: 'US', currency: 'USD' },
        },
        {
          asset_id: 'asset-1',
          quantity: 5,
          price: 120, // Total Buy Cost: 1000 + 600 = 1600. Total Buy Qty: 15. Avg: 106.66
          type: 'BUY',
          assets: { id: 'asset-1', symbol: 'AAPL', name_en: 'Apple', asset_class: 'US Equity', market: 'US', currency: 'USD' },
        },
        {
          asset_id: 'asset-1',
          quantity: 5,
          price: 150, // SELL. Remaining Qty: 10. Avg Cost should remain ~106.66
          type: 'SELL',
          assets: { id: 'asset-1', symbol: 'AAPL', name_en: 'Apple', asset_class: 'US Equity', market: 'US', currency: 'USD' },
        },
        {
          asset_id: 'asset-2',
          quantity: 100,
          price: 1,
          type: 'BUY',
          assets: { id: 'asset-2', symbol: 'VND', name_en: 'Vietnam Dong', asset_class: 'Cash', market: 'VN', currency: 'VND' },
        },
      ];

      // Mock Supabase chain
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });
      mockSelect.mockReturnValue({ eq: mockEq });

      const result = await service.getHoldings(mockUserId);

      expect(result).toHaveLength(2);
      
      const aapl = result.find(h => h.symbol === 'AAPL');
      expect(aapl).toBeDefined();
      expect(aapl!.total_quantity).toBe(10);
      // Avg Cost Logic:
      // Buy 1: 10 @ 100 = 1000. Qty=10.
      // Buy 2: 5 @ 120 = 600. Total Cost = 1600. Total Qty = 15. Avg = 106.666
      // Sell 1: 5 @ 150. Reduced Cost = 5 * 106.666 = 533.33. Remaining Cost = 1066.67. Remaining Qty = 10. Avg = 106.666.
      expect(aapl!.avg_cost).toBeCloseTo(106.666, 3);
      
      const vnd = result.find(h => h.symbol === 'VND');
      expect(vnd).toBeDefined();
      expect(vnd!.total_quantity).toBe(100);
      expect(vnd!.avg_cost).toBe(1);
    });

    it('should include methodology transparency fields (calculationMethod and dataSource)', async () => {
      // Mock transactions
      const mockTransactions = [
        {
          asset_id: 'asset-1',
          quantity: 10,
          price: 100,
          type: 'BUY',
          assets: { 
            id: 'asset-1',
            symbol: 'AAPL', 
            name_en: 'Apple Inc.', 
            asset_class: 'US Equity', 
            market: 'US', 
            currency: 'USD' 
          },
        },
      ];

      // Mock Supabase chain
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockResolvedValue({
        data: mockTransactions,
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      });
      mockSelect.mockReturnValue({ eq: mockEq });
      mockCacheService.get.mockResolvedValue(null); // No cache

      const result = await service.getHoldings(mockUserId);

      expect(result).toHaveLength(1);
      const holding = result[0];
      
      // Verify methodology fields are populated
      expect(holding.calculationMethod).toBe('WEIGHTED_AVG');
      expect(holding.dataSource).toBe('Manual Entry');
    });
  });
});
