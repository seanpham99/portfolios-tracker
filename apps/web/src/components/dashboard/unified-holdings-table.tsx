import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

// Mock Data
const HOLDINGS = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc', type: 'US Equity', price: 185.92, change: 1.25, value: 15450.00, pl: 2350.50 },
  { id: '2', symbol: 'VCB', name: 'Vietcombank', type: 'VN Stock', price: 92.50, change: -0.8, value: 8500.00, pl: -120.00 },
  { id: '3', symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', price: 65432.10, change: 4.5, value: 32000.00, pl: 12500.00 },
  { id: '4', symbol: 'TSLA', name: 'Tesla', type: 'US Equity', price: 175.00, change: -2.1, value: 5250.00, pl: -450.00 },
  { id: '5', symbol: 'FPT', name: 'FPT Corp', type: 'VN Stock', price: 115.00, change: 0.5, value: 12000.00, pl: 3200.00 },
];

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: string;
  price: number;
  change: number;
  value: number;
  pl: number;
}

interface UnifiedHoldingsTableProps {
  holdings?: Holding[];
}

export function UnifiedHoldingsTable({ holdings = HOLDINGS }: UnifiedHoldingsTableProps) {
  return (
    <div className="w-full rounded-xl border border-white/5 bg-zinc-900/50">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <h3 className="font-serif text-lg font-light text-white">Holdings</h3>
        <button className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10">
          <TrendingUp className="h-3.5 w-3.5" />
          Analytics
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs text-zinc-500">
              <th className="px-6 py-3 font-medium">Asset</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium text-right">Price</th>
              <th className="px-6 py-3 font-medium text-right">24h Change</th>
              <th className="px-6 py-3 font-medium text-right">Value (USD)</th>
              <th className="px-6 py-3 font-medium text-right">P/L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {holdings.map((asset) => (
              <tr key={asset.id} className="group hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-medium text-white">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className="font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-zinc-500">{asset.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                    ${asset.type === 'VN Stock' ? 'bg-red-500/10 text-red-400' : 
                      asset.type === 'US Equity' ? 'bg-blue-500/10 text-blue-400' : 
                      'bg-amber-500/10 text-amber-400'}`}>
                    {asset.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-zinc-300">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.price)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  <div className={`flex items-center justify-end gap-1 ${asset.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {asset.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(asset.change).toFixed(2)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium tabular-nums text-white">
                   {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.value)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  <span className={asset.pl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {asset.pl >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(asset.pl)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
