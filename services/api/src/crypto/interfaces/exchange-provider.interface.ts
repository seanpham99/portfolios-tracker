export interface ExchangeBalance {
  asset: string;
  free: string;
  locked: string;
  total: string;
  usdValue: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  permissions?: string[];
}

export interface ExchangeProvider {
  /**
   * Get the unique identifier of the exchange (e.g., 'binance', 'okx')
   */
  getName(): string;

  /**
   * Validate API credentials
   */
  validateKeys(
    apiKey: string,
    secret: string,
    passphrase?: string,
  ): Promise<ValidationResult>;

  /**
   * Fetch spot balances
   */
  fetchBalances(
    apiKey: string,
    secret: string,
    passphrase?: string,
  ): Promise<ExchangeBalance[]>;
}
