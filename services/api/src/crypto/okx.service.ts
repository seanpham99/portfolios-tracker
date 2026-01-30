/**
 * OKX Service - CCXT Wrapper for OKX API
 * Story: 5.2 OKX API Sync (Read-Only)
 *
 * Provides validated access to OKX exchange for:
 * - Credential validation
 * - Spot balance fetching with dust filtering
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as ccxt from 'ccxt';
import Decimal from 'decimal.js';
import {
  ExchangeProvider,
  ExchangeBalance,
  ValidationResult,
} from './interfaces/exchange-provider.interface';
import { ExchangeRegistry } from './exchange.registry';

/**
 * Map CCXT errors to user-friendly messages
 */
function mapCcxtError(error: unknown): string {
  if (error instanceof ccxt.AuthenticationError) {
    return 'Invalid API credentials or Passphrase.';
  }
  if (error instanceof ccxt.RateLimitExceeded) {
    return 'Too many requests. Please wait a moment.';
  }
  if (error instanceof ccxt.NetworkError) {
    return 'Unable to connect to OKX. Check your network.';
  }
  if (error instanceof ccxt.ExchangeNotAvailable) {
    return 'OKX is temporarily unavailable.';
  }
  if (error instanceof ccxt.ExchangeError) {
    return `Exchange error: ${(error as Error).message}`;
  }
  return 'An unexpected error occurred while connecting to OKX.';
}

@Injectable()
export class OkxService implements ExchangeProvider, OnModuleInit {
  private readonly logger = new Logger(OkxService.name);
  private readonly DUST_THRESHOLD_USD = new Decimal('1');

  constructor(private readonly registry: ExchangeRegistry) {}

  onModuleInit() {
    this.registry.register(this);
  }

  getName(): string {
    return 'okx';
  }

  /**
   * Create a configured CCXT OKX instance
   */
  private createExchange(
    apiKey: string,
    secret: string,
    passphrase?: string,
  ): ccxt.okx {
    return new ccxt.okx({
      apiKey,
      secret,
      password: passphrase, // OKX uses 'password' for passphrase
      enableRateLimit: true,
      timeout: 30000,
      options: {
        adjustForTimeDifference: true,
      },
    });
  }

  /**
   * Validate API credentials by attempting to fetch account balance
   */
  async validateKeys(
    apiKey: string,
    secret: string,
    passphrase?: string,
  ): Promise<ValidationResult> {
    if (!passphrase) {
      return {
        valid: false,
        error: 'Passphrase is required for OKX connection.',
      };
    }

    const exchange = this.createExchange(apiKey, secret, passphrase);

    try {
      // Attempt to fetch balance - requires valid read permissions
      await exchange.fetchBalance();

      this.logger.log('OKX API keys validated successfully');

      return {
        valid: true,
        permissions: ['read'], // OKX usually just needs read permissions
      };
    } catch (error) {
      this.logger.warn(
        `OKX API validation failed: ${(error as Error).message}`,
      );

      return {
        valid: false,
        error: mapCcxtError(error),
      };
    }
  }

  /**
   * Fetch spot balances from OKX
   * Filters out dust balances (< $1 USD equivalent)
   *
   * @remarks
   * **OKX Account Types (MVP Decision):**
   * OKX has multiple account types: trading, funding, savings, etc.
   * CCXT's fetchBalance aggregates across these by default.
   * For MVP, we rely on this default behavior to capture spot holdings.
   * Future enhancement: Add account type filtering if needed.
   *
   * **Assets Without USDT Pairs:**
   * Assets that don't have a direct /USDT trading pair will show $0 USD value
   * and may be filtered as dust. This is consistent with Binance behavior.
   * Future enhancement: Try BTC/ETH pairs as intermediate pricing.
   */
  async fetchBalances(
    apiKey: string,
    secret: string,
    passphrase?: string,
  ): Promise<ExchangeBalance[]> {
    if (!passphrase) {
      throw new Error('Passphrase is required for OKX connection.');
    }

    const exchange = this.createExchange(apiKey, secret, passphrase);

    try {
      // Fetch balance from OKX
      const balance = await exchange.fetchBalance();
      const balances: ExchangeBalance[] = [];

      // Get USDT ticker prices for USD value estimation
      const tickers = await exchange.fetchTickers();

      // Iterate over all currencies in the balance
      const totals = balance.total as unknown as Record<string, number>;
      const frees = balance.free as unknown as Record<string, number>;
      const useds = balance.used as unknown as Record<string, number>;
      const currencies = Object.keys(totals || {});

      for (const asset of currencies) {
        const totalAmount = totals[asset];
        if (totalAmount === undefined) continue;

        const total = new Decimal(totalAmount);

        // Skip zero balances
        if (total.isZero()) continue;

        // Calculate USD equivalent
        let usdValue = new Decimal(0);

        if (
          asset === 'USDT' ||
          asset === 'USD' ||
          asset === 'USDC' ||
          asset === 'BUSD'
        ) {
          usdValue = total;
        } else {
          // Try to find USDT pair
          // OKX pairs are usually formatted as BASE/QUOTE (e.g. BTC/USDT)
          // CCXT standardizes this, but we should be robust
          const symbol = `${asset}/USDT`;
          const ticker = tickers[symbol];

          if (ticker?.last) {
            usdValue = total.mul(new Decimal(ticker.last));
          }
          // Assets without /USDT pair: USD value stays at 0, may be filtered as dust
          // This is acceptable for MVP - see method JSDoc for future enhancement notes
        }

        // Filter dust (< $1 USD)
        if (usdValue.lt(this.DUST_THRESHOLD_USD)) {
          this.logger.debug(
            `Skipping dust asset ${asset}: $${usdValue.toFixed(2)}`,
          );
          continue;
        }

        const freeAmount = new Decimal(frees[asset] ?? 0);
        const lockedAmount = new Decimal(useds[asset] ?? 0);

        balances.push({
          asset,
          free: freeAmount.toString(),
          locked: lockedAmount.toString(),
          total: total.toString(),
          usdValue: usdValue.toFixed(2),
        });
      }

      this.logger.log(`Fetched ${balances.length} non-dust balances from OKX`);
      return balances;
    } catch (error) {
      this.logger.error(
        `Failed to fetch OKX balances: ${(error as Error).message}`,
      );
      throw new Error(mapCcxtError(error));
    }
  }
}
