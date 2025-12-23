import type { Asset } from "@/components/asset-blade"
import type { Stage } from "@/components/stage-slider"

// Generate realistic sparkline data
function generateSparkline(trend: "up" | "down" | "volatile", points = 20): number[] {
  const data: number[] = []
  let value = 100

  for (let i = 0; i < points; i++) {
    const volatility = trend === "volatile" ? 8 : 4
    const direction = trend === "up" ? 0.3 : trend === "down" ? -0.3 : 0
    value = value + (Math.random() - 0.5 + direction) * volatility
    data.push(Math.max(50, Math.min(150, value)))
  }

  return data
}

export const equityAssets: Asset[] = [
  {
    id: "aapl",
    symbol: "AAPL",
    name: "Apple Inc.",
    value: 45230.5,
    change: 2.34,
    allocation: 18,
    sparklineData: generateSparkline("up"),
  },
  {
    id: "msft",
    symbol: "MSFT",
    name: "Microsoft Corp.",
    value: 38420.75,
    change: 1.87,
    allocation: 15,
    sparklineData: generateSparkline("up"),
  },
  {
    id: "googl",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    value: 28150.0,
    change: -0.42,
    allocation: 11,
    sparklineData: generateSparkline("down"),
  },
  {
    id: "nvda",
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    value: 52340.25,
    change: 5.67,
    allocation: 21,
    sparklineData: generateSparkline("up"),
  },
  {
    id: "tsla",
    symbol: "TSLA",
    name: "Tesla Inc.",
    value: 18920.0,
    change: -1.23,
    allocation: 8,
    sparklineData: generateSparkline("volatile"),
  },
]

export const cryptoAssets: Asset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    value: 42150.0,
    change: 3.45,
    allocation: 35,
    sparklineData: generateSparkline("up"),
    icon: "₿",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    value: 28340.5,
    change: 2.12,
    allocation: 24,
    sparklineData: generateSparkline("up"),
    icon: "Ξ",
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    value: 12450.75,
    change: 8.92,
    allocation: 10,
    sparklineData: generateSparkline("up"),
  },
  {
    id: "ada",
    symbol: "ADA",
    name: "Cardano",
    value: 5230.0,
    change: -2.34,
    allocation: 4,
    sparklineData: generateSparkline("down"),
  },
]

export const realEstateAssets: Asset[] = [
  {
    id: "vanguard-reit",
    symbol: "VNQ",
    name: "Vanguard Real Estate",
    value: 32150.0,
    change: 0.87,
    allocation: 40,
    sparklineData: generateSparkline("up"),
  },
  {
    id: "downtown-condo",
    symbol: "RE-1",
    name: "Downtown Condo",
    value: 285000.0,
    change: 1.2,
    allocation: 55,
    sparklineData: generateSparkline("up"),
  },
  {
    id: "realty-income",
    symbol: "O",
    name: "Realty Income Corp",
    value: 8420.5,
    change: -0.32,
    allocation: 5,
    sparklineData: generateSparkline("volatile"),
  },
]

export const stages: Stage[] = [
  {
    id: "equities",
    name: "Equities",
    assets: equityAssets,
    totalValue: equityAssets.reduce((sum, a) => sum + a.value, 0),
    change: 2.14,
  },
  {
    id: "crypto",
    name: "Crypto",
    assets: cryptoAssets,
    totalValue: cryptoAssets.reduce((sum, a) => sum + a.value, 0),
    change: 4.32,
  },
  {
    id: "real-estate",
    name: "Real Estate",
    assets: realEstateAssets,
    totalValue: realEstateAssets.reduce((sum, a) => sum + a.value, 0),
    change: 0.92,
  },
]

export const netWorthHistory = Array.from({ length: 30 }, (_, i) => {
  const base = 450000
  const trend = i * 2500
  const volatility = Math.random() * 15000 - 7500
  return base + trend + volatility
})

export const aiInsights = [
  "Your tech allocation is 45% above benchmark. Consider diversifying into defensive sectors for balance.",
  "Bitcoin holdings show strong momentum. DCA opportunity detected based on 200-day moving average.",
  "Real estate REIT yields outperforming treasuries by 2.3%. Current allocation is optimal for income goals.",
]
