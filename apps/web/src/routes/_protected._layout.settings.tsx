import { useSettings, useUpdateSettings } from "@/api/hooks/use-settings";
import { Currency } from "@repo/api-types";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-8 py-6">
      <h2 className="font-serif text-2xl font-light text-white mb-6">
        Settings
      </h2>
      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Currency</label>
        <div className="flex gap-2">
          {([Currency.USD, Currency.VND, Currency.EUR, Currency.GBP] as const).map((currency) => (
            <button
              key={currency}
              onClick={() => updateSettings.mutate({ currency })}
              disabled={updateSettings.isPending}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                settings?.currency === currency
                  ? "bg-indigo-500 text-white"
                  : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">
          Auto-refresh interval: {settings?.refresh_interval || 60}s
        </label>
        <input
          type="range"
          min={10}
          max={300}
          step={10}
          value={settings?.refresh_interval || 60}
          onChange={(e) =>
            updateSettings.mutate({ refresh_interval: Number(e.target.value) })
          }
          disabled={updateSettings.isPending}
          className="w-full accent-indigo-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-zinc-500 mt-1">
          <span>10s</span>
          <span>300s (5min)</span>
        </div>
      </div>
    </div>
  );
}
