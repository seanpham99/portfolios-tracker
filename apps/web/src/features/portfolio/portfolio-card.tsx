"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { PortfolioSummaryDto } from "@workspace/shared-types/api";
import { ArrowUpRight, ArrowDownRight, Briefcase, Wallet } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { motion } from "framer-motion";

interface PortfolioCardProps {
  portfolio: PortfolioSummaryDto;
  index?: number;
}

export function PortfolioCard({ portfolio, index = 0 }: PortfolioCardProps) {
  const isPositive = portfolio.change24h >= 0;

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link href={`/portfolio/${portfolio.id}`} className="block h-full group">
        <Card className="h-full border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-white/10 hover:shadow-xl hover:shadow-indigo-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {portfolio.name}
            </CardTitle>
            <div className="p-2 rounded-full bg-white/5 text-muted-foreground group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono tracking-tight">
              {formatCurrency(portfolio.netWorth, portfolio.base_currency)}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div
                className={cn(
                  "flex items-center text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm",
                  isPositive ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {isPositive ? "+" : ""}
                {formatPercent(portfolio.change24hPercent)}
              </div>
              <div className="text-xs text-muted-foreground/60">Today</div>
            </div>

            {/* Decoration: Subtle gradient line at bottom */}
            <div className="mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full w-2/3 bg-linear-to-r from-indigo-500/50 to-purple-500/50 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

PortfolioCard.Skeleton = function PortfolioCardSkeleton() {
  return (
    <Card className="h-full border-white/5 bg-white/5 animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px] bg-white/5" />
        <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[150px] bg-white/5 mb-3" />
        <Skeleton className="h-4 w-[200px] bg-white/5" />
      </CardContent>
    </Card>
  );
};
