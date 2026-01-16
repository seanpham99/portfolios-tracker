import { type Database } from "../database/index.js";

export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];

export interface PortfolioSummaryDto extends Portfolio {
  netWorth: number;
  change24h: number;
  change24hPercent: number;
  allocation?: {
    label: string;
    value: number;
    color: string;
  }[];
}
