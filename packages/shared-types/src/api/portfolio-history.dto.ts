import { IsString, IsNumber, IsOptional, IsObject, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class PortfolioSnapshotDto {
    @IsString()
    id: string;

    @IsString()
    portfolio_id: string;

    @IsString()
    user_id: string;

    @IsNumber()
    net_worth: number;

    @IsNumber()
    total_cost: number;

    @IsObject()
    @IsOptional()
    metadata: Record<string, any> | null;

    @IsDateString()
    timestamp: string;

    @IsDateString()
    created_at: string;
}

export class PortfolioHistoryResponseDto {
    data: PortfolioSnapshotDto[];
    meta: {
        range: string;
        count: number;
        staleness?: string;
    };
}
