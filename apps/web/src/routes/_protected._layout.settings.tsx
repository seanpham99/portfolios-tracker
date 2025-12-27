import { useSettings } from "@/stores/portfolio-store";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  return (
    <div className="mx-auto max-w-md px-8 py-6">
      <h2 className="font-serif text-2xl font-light text-white mb-6">
        Settings
      </h2>
      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Currency</label>
        <div className="flex gap-2">
          {(["USD", "EUR", "GBP"] as const).map((currency) => (
            <button
              key={currency}
              onClick={() => updateSettings({ currency })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                settings.currency === currency
                  ? "bg-indigo-500 text-white"
                  : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">
          Auto-refresh interval: {settings.refreshInterval}s
        </label>
        <input
          type="range"
          min={10}
          max={120}
          step={10}
          value={settings.refreshInterval}
          onChange={(e) =>
            updateSettings({ refreshInterval: Number(e.target.value) })
          }
          className="w-full accent-indigo-500"
        />
      </div>
    </div>
  );
}
