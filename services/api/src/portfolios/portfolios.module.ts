import { Module } from '@nestjs/common';
import { PortfoliosController } from './portfolios.controller';
import { PortfoliosService } from './portfolios.service';
import { AuthGuard } from './guards';

import { MarketDataModule } from '../market-data';
import { SnapshotService } from './snapshot.service';

/**
 * Module for portfolio management feature
 */
@Module({
  imports: [MarketDataModule],
  controllers: [PortfoliosController],
  providers: [PortfoliosService, AuthGuard, SnapshotService],
  exports: [PortfoliosService, AuthGuard, SnapshotService],
})
export class PortfoliosModule {}
