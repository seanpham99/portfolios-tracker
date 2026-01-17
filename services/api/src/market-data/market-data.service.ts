import { Injectable, Logger, Inject } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';
import { CacheService } from '../common/cache';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@workspace/shared-types/database';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly COIN_ID_TTL = 86400; // 24 hours
  private readonly yahooFinance = new YahooFinance({
    suppressNotices: ['yahooSurvey'],
  });

  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Get current price for an asset
   * @param symbol Ticker symbol (e.g. AAPL, BTC, VIC)
   * @param market Market code (e.g. US, VN, CRYPTO)
   * @param assetClass Asset class (e.g. EQUITY, CRYPTO)
   */
  async getCurrentPrice(
    symbol: string,
    market?: string,
    assetClass?: string,
  ): Promise<number | null> {
    const isCrypto =
      (market && market.toUpperCase() === 'CRYPTO') ||
      (assetClass && assetClass.toUpperCase() === 'CRYPTO');

    if (isCrypto) {
      return this.getCryptoPrice(symbol, market, assetClass);
    }

    // Default to Yahoo Finance for non-crypto
    const yfSymbol = this.mapToYahooFinanceSymbol(symbol, market, assetClass);
    return this.getYahooPrice(yfSymbol, symbol);
  }

  /**
   * Fetch crypto price from CoinGecko using ID from database
   * Fallback to Yahoo Finance if CoinGecko fails or ID not found
   */
  private async getCryptoPrice(
    symbol: string,
    market?: string,
    assetClass?: string,
  ): Promise<number | null> {
    try {
      const coinId = await this.getCoinGeckoId(symbol);

      if (coinId) {
        const cacheKey = `price:coingecko:${coinId}`;
        const cachedPrice = await this.cacheService.get<number>(cacheKey);

        if (cachedPrice !== null && cachedPrice !== undefined) {
          return cachedPrice;
        }

        const url = `${COINGECKO_API_URL}/simple/price?ids=${coinId}&vs_currencies=usd`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const price = data[coinId]?.usd;

          if (price) {
            await this.cacheService.set(cacheKey, price, this.CACHE_TTL);
            // Optimization: If we have cache hit here, we return early
            return price;
          }
        } else {
          this.logger.warn(
            `CoinGecko API error for ${symbol}: ${response.statusText}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to fetch CoinGecko price for ${symbol}: ${(error as Error).message}`,
      );
    }

    // Fallback to Yahoo Finance
    this.logger.log(`Falling back to Yahoo Finance for ${symbol}`);
    const yfSymbol = this.mapToYahooFinanceSymbol(symbol, market, assetClass);
    return this.getYahooPrice(yfSymbol, symbol);
  }

  /**
   * Resolve CoinGecko ID from Database or Cache
   * Note: COIN_ID_TTL caches the MAPPING (Symbol -> ID), not the price.
   * IDs change very rarely (e.g. BTC -> bitcoin), so 24h is safe.
   */
  private async getCoinGeckoId(symbol: string): Promise<string | null> {
    const cacheKey = `asset:metadata:${symbol.toUpperCase()}`;
    const cachedId = await this.cacheService.get<string>(cacheKey);

    if (cachedId) {
      return cachedId;
    }

    // Lookup in Database
    const { data, error } = await this.supabase
      .from('assets')
      .select('metadata')
      .eq('symbol', symbol.toUpperCase())
      .eq('asset_class', 'CRYPTO')
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Database error looking up asset ${symbol}: ${error.message}`,
      );
      return null;
    }

    if (!data || !data.metadata) {
      this.logger.warn(`No metadata found for crypto asset ${symbol}`);
      return null;
    }

    const metadata = data.metadata as any;
    const coingeckoId = metadata.coingecko_id;

    if (coingeckoId) {
      await this.cacheService.set(cacheKey, coingeckoId, this.COIN_ID_TTL);
      return coingeckoId;
    }

    this.logger.warn(`No coingecko_id in metadata for ${symbol}`);
    return null;
  }

  /**
   * Fetch price from Yahoo Finance
   */
  private async getYahooPrice(
    yfSymbol: string,
    originalSymbol: string,
  ): Promise<number | null> {
    const cacheKey = `price:yahoo:${yfSymbol}`;
    const cachedPrice = await this.cacheService.get<number>(cacheKey);

    if (cachedPrice !== null && cachedPrice !== undefined) {
      return cachedPrice;
    }

    try {
      const quote = await this.yahooFinance.quote(yfSymbol);
      const price = (quote as any).regularMarketPrice;

      if (price) {
        await this.cacheService.set(cacheKey, price, this.CACHE_TTL);
        return price;
      }
      return null;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch Yahoo price for ${originalSymbol} (${yfSymbol}): ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * Map internal symbol to Yahoo Finance symbol
   */
  private mapToYahooFinanceSymbol(
    symbol: string,
    market?: string,
    assetClass?: string,
  ): string {
    const s = symbol.toUpperCase();
    const m = (market || '').toUpperCase();
    const ac = (assetClass || '').toUpperCase();

    if (m === 'VN') {
      return s.endsWith('.VN') ? s : `${s}.VN`;
    }
    // Used for fallback
    if (m === 'CRYPTO' || ac === 'CRYPTO') {
      return s.endsWith('-USD') ? s : `${s}-USD`;
    }
    // US and others usually match
    return s;
  }
}
