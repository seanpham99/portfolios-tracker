import { Injectable, Logger } from '@nestjs/common';
import { ExchangeProvider } from './interfaces/exchange-provider.interface';

@Injectable()
export class ExchangeRegistry {
  private readonly logger = new Logger(ExchangeRegistry.name);
  private readonly providers = new Map<string, ExchangeProvider>();

  register(provider: ExchangeProvider) {
    const name = provider.getName();
    this.providers.set(name, provider);
    this.logger.log(`Registered exchange provider: ${name}`);
  }

  get(name: string): ExchangeProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Exchange provider not found: ${name}`);
    }
    return provider;
  }

  getSupportedExchanges(): string[] {
    return Array.from(this.providers.keys());
  }
}
