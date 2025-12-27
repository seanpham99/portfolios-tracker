import { IsString, IsNumber, IsOptional } from 'class-validator';

export class HoldingDto {
  @IsString()
  asset_id: string;

  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsString()
  asset_class: string;

  @IsNumber()
  total_quantity: number;

  @IsNumber()
  avg_cost: number;

  @IsString()
  @IsOptional()
  market?: string;

  @IsString()
  @IsOptional()
  currency?: string;
  
  // Computed on frontend or optional backend fields
  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  value?: number;

  @IsNumber()
  @IsOptional()
  pl?: number;

  @IsNumber()
  @IsOptional()
  pl_percent?: number;
}
