import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { CacheModule } from '../common/cache';
import { SupabaseModule } from '../common/supabase';

@Module({
  imports: [CacheModule, SupabaseModule],
  providers: [MarketDataService],
  exports: [MarketDataService],
})
export class MarketDataModule {}
