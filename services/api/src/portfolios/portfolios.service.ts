import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Database } from '@repo/database-types';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { CreateTransactionDto, HoldingDto, CalculationMethod } from '@repo/api-types';
import { Portfolio } from './portfolio.entity';
import { CacheService } from '../cache';


/**
 * Service for portfolio CRUD operations
 * Uses Supabase client with RLS for data access
 * Implements cache invalidation per Architecture Decision 1.3
 */
@Injectable()
export class PortfoliosService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new portfolio for the authenticated user
   */
  async create(
    userId: string,
    createDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        name: createDto.name,
        base_currency: createDto.base_currency,
        description: createDto.description ?? null,
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, createDto.name);
    }

    // Invalidate portfolios list cache for user
    await this.cacheService.del(`portfolios:${userId}`);

    return data;
  }

  /**
   * Find all portfolios for the authenticated user
   */
  async findAll(userId: string): Promise<Portfolio[]> {
    // Check cache first
    const cacheKey = `portfolios:${userId}`;
    const cached = await this.cacheService.get<Portfolio[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const portfolios = data ?? [];

    // Cache the result
    await this.cacheService.set(cacheKey, portfolios);

    return portfolios;
  }

  /**
   * Find a single portfolio by ID
   */
  async findOne(userId: string, id: string): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Portfolio with ID "${id}" not found`);
      }
      throw error;
    }

    return data;
  }

  /**
   * Update an existing portfolio
   */
  async update(
    userId: string,
    id: string,
    updateDto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    // First verify the portfolio exists and belongs to the user
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('portfolios')
      .update({
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.base_currency !== undefined && {
          base_currency: updateDto.base_currency,
        }),
        ...(updateDto.description !== undefined && {
          description: updateDto.description,
        }),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.handleError(error, updateDto.name);
    }

    // Invalidate caches
    await this.cacheService.invalidatePortfolio(userId, id);

    return data;
  }

  /**
   * Delete a portfolio
   */
  async remove(userId: string, id: string): Promise<void> {
    // First verify the portfolio exists and belongs to the user
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    // Invalidate caches
    await this.cacheService.invalidatePortfolio(userId, id);
  }

  /**
   * Handle Supabase errors
   */
  private handleError(error: PostgrestError, name?: string): never {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new ConflictException(
        `Portfolio with name "${name}" already exists`,
      );
    }
    throw error;
  }

  /**
   * Add a transaction to a portfolio
   * Implements cache invalidation per Architecture Decision 1.3
   */
  async addTransaction(
    userId: string,
    portfolioId: string,
    createDto: CreateTransactionDto,
  ): Promise<any> {
    // 1. Verify portfolio ownership
    await this.findOne(userId, portfolioId);

    // 2. Validate DTO portfolio_id matches URL param
    if (createDto.portfolio_id !== portfolioId) {
      throw new ConflictException('Portfolio ID in body does not match URL parameter');
    }

    // 3. Insert transaction
    const { data, error } = await this.supabase
      .from('transactions')
      .insert({
        portfolio_id: portfolioId,
        asset_id: createDto.asset_id,
        type: createDto.type,
        quantity: createDto.quantity,
        price: createDto.price,
        fee: createDto.fee ?? 0,
        transaction_date: createDto.transaction_date ?? new Date().toISOString(),
        notes: createDto.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 4. Invalidate Upstash cache keys for the portfolio (Decision 1.3)
    await this.cacheService.invalidatePortfolio(userId, portfolioId);

    return data;
  }


  /**
   * Get aggregated holdings for all portfolios of the authenticated user
   */
  async getHoldings(userId: string): Promise<HoldingDto[]> {
    // Check cache first
    const cacheKey = `holdings:${userId}`;
    const cached = await this.cacheService.get<HoldingDto[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query all transactions for user across all portfolios
    // Joining assets to get details
    const { data: transactions, error } = await this.supabase
      .from('transactions')
      .select(`
        asset_id,
        quantity,
        price,
        type,
        assets (
          id,
          symbol,
          name_en,
          name_local,
          asset_class,
          market,
          currency
        ),
        portfolios!inner (
          user_id
        )
      `)
      .eq('portfolios.user_id', userId);

    if (error) {
      throw error;
    }

    // Aggregate holdings
    const holdingsMap = new Map<string, {
      qty: number;
      cost: number;
      asset: any;
    }>();

    for (const tx of (transactions || [])) {
      if (!tx.assets) continue; // Should not happen with inner join logic implicitly

      const assetId = tx.asset_id;
      if (!holdingsMap.has(assetId)) {
        holdingsMap.set(assetId, { 
          qty: 0, 
          cost: 0, 
          asset: tx.assets 
        });
      }
      const entry = holdingsMap.get(assetId)!;

      if (tx.type === 'BUY') {
        entry.qty += tx.quantity;
        entry.cost += tx.quantity * tx.price;
      } else if (tx.type === 'SELL') {
        // Weighted Average Cost Logic: Cost basis reduces proportionally
        const currentAvg = entry.qty > 0 ? entry.cost / entry.qty : 0;
        entry.qty -= tx.quantity;
        entry.cost -= tx.quantity * currentAvg;
      }
      
      // Handle floating point errors if qty goes to approx 0
      if (Math.abs(entry.qty) < 0.000001) {
        entry.qty = 0;
        entry.cost = 0;
      }
    }

    // Convert to DTO
    const holdings: HoldingDto[] = Array.from(holdingsMap.values())
      .map(entry => {
        // Handle case where asset might be an array or object (Supabase JS single vs undefined)
        const asset = Array.isArray(entry.asset) ? entry.asset[0] : entry.asset;
        
        return {
          asset_id: asset.id,
          symbol: asset.symbol,
          name: asset.name_en || asset.name_local || asset.symbol,
          asset_class: asset.asset_class,
          market: asset.market,
          currency: asset.currency,
          total_quantity: entry.qty,
          avg_cost: entry.qty > 0 ? entry.cost / entry.qty : 0,
          // Methodology transparency fields
          calculationMethod: CalculationMethod.WEIGHTED_AVG,
          dataSource: 'Manual Entry', // Future: could be 'Binance via CCXT', 'vnstock', etc.
        };
      })
      .filter(h => h.total_quantity > 0); // Only return active holdings

    // Cache result (30s default TTL is fine)
    await this.cacheService.set(cacheKey, holdings);

    return holdings;
  }
}
