"use client";

import type { Asset } from "@/components/asset-blade";
import type { Stage } from "@/components/stage-slider";
import { useSyncExternalStore, useCallback } from "react";

export interface Notification {
  id: string;
  type:
    | "price_alert"
    | "portfolio_change"
    | "market_movement"
    | "system"
    | "asset_request";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  assetId?: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
}

export interface Settings {
  currency: "USD" | "EUR" | "GBP";
  refreshInterval: number;
  notifications: {
    priceAlerts: boolean;
    dailySummary: boolean;
    significantMovements: boolean;
  };
}

export interface AssetRequest {
  id: string;
  symbol: string;
  name: string;
  type: "stock" | "crypto" | "etf" | "real_estate" | "other";
  exchange?: string;
  country?: string;
  status: "pending" | "processing" | "approved" | "rejected";
  requestedBy: string;
  requestedAt: Date;
  processedAt?: Date;
  adminNotes?: string;
  estimatedCompletion?: Date;
  progress: number; // 0-100
}

interface PortfolioState {
  stages: Stage[];
  notifications: Notification[];
  transactions: Transaction[];
  settings: Settings;
  lastUpdated: Date;
  assetRequests: AssetRequest[];
}

// Generate realistic sparkline data
function generateSparkline(
  trend: "up" | "down" | "volatile",
  points = 20,
): number[] {
  const data: number[] = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    const volatility = trend === "volatile" ? 8 : 4;
    const direction = trend === "up" ? 0.3 : trend === "down" ? -0.3 : 0;
    value = value + (Math.random() - 0.5 + direction) * volatility;
    data.push(Math.max(50, Math.min(150, value)));
  }
  return data;
}

// Initial data
const equityAssets: Asset[] = [
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
];

const cryptoAssets: Asset[] = [
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
];

const realEstateAssets: Asset[] = [
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
];

const initialStages: Stage[] = [
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
];

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "price_alert",
    title: "NVDA up 5%+",
    message:
      "NVIDIA Corp. has risen 5.67% today, exceeding your alert threshold.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    assetId: "nvda",
  },
  {
    id: "2",
    type: "market_movement",
    title: "Crypto Rally",
    message: "Crypto market up 4.32% in the last 24 hours.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: "3",
    type: "portfolio_change",
    title: "Daily Summary",
    message: "Your portfolio gained $12,450 (+2.1%) today.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

const initialSettings: Settings = {
  currency: "USD",
  refreshInterval: 30,
  notifications: {
    priceAlerts: true,
    dailySummary: true,
    significantMovements: true,
  },
};

const initialAssetRequests: AssetRequest[] = [
  {
    id: "req-1",
    symbol: "RELIANCE",
    name: "Reliance Industries",
    type: "stock",
    exchange: "NSE",
    country: "India",
    status: "processing",
    requestedBy: "user",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    progress: 65,
    estimatedCompletion: new Date(Date.now() + 1000 * 60 * 60 * 2),
  },
  {
    id: "req-2",
    symbol: "PEPE",
    name: "Pepe Coin",
    type: "crypto",
    status: "pending",
    requestedBy: "user",
    requestedAt: new Date(Date.now() - 1000 * 60 * 30),
    progress: 0,
  },
];

// Store implementation
let state: PortfolioState = {
  stages: initialStages,
  notifications: initialNotifications,
  transactions: [],
  settings: initialSettings,
  lastUpdated: new Date(),
  assetRequests: initialAssetRequests,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const portfolioStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  getServerSnapshot() {
    return state;
  },

  // Actions
  updatePrices() {
    const newStages = state.stages.map((stage) => {
      const newAssets = stage.assets.map((asset) => {
        const priceChange = (Math.random() - 0.48) * 0.5;
        const newValue = asset.value * (1 + priceChange / 100);
        const newChange = asset.change + priceChange * 0.1;
        const newSparkline = [
          ...asset.sparklineData.slice(1),
          asset.sparklineData[asset.sparklineData.length - 1] *
            (1 + priceChange / 100),
        ];
        return {
          ...asset,
          value: newValue,
          change: newChange,
          sparklineData: newSparkline,
        };
      });
      const totalValue = newAssets.reduce((sum, a) => sum + a.value, 0);
      const avgChange =
        newAssets.reduce((sum, a) => sum + a.change, 0) / newAssets.length;
      return { ...stage, assets: newAssets, totalValue, change: avgChange };
    });
    state = { ...state, stages: newStages, lastUpdated: new Date() };
    emitChange();
  },

  addNotification(
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) {
    const newNotification: Notification = {
      ...notification,
      id: globalThis.crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };
    state = {
      ...state,
      notifications: [newNotification, ...state.notifications],
    };
    emitChange();
  },

  markNotificationRead(id: string) {
    const notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    state = { ...state, notifications };
    emitChange();
  },

  markAllNotificationsRead() {
    const notifications = state.notifications.map((n) => ({
      ...n,
      read: true,
    }));
    state = { ...state, notifications };
    emitChange();
  },

  addTransaction(transaction: Omit<Transaction, "id" | "timestamp">) {
    const newTransaction: Transaction = {
      ...transaction,
      id: globalThis.crypto.randomUUID(),
      timestamp: new Date(),
    };
    state = { ...state, transactions: [newTransaction, ...state.transactions] };
    emitChange();
  },

  addAsset(stageId: string, asset: Asset) {
    const newStages = state.stages.map((stage) => {
      if (stage.id === stageId) {
        const newAssets = [...stage.assets, asset];
        const totalValue = newAssets.reduce((sum, a) => sum + a.value, 0);
        return { ...stage, assets: newAssets, totalValue };
      }
      return stage;
    });
    state = { ...state, stages: newStages };
    emitChange();
  },

  updateSettings(settings: Partial<Settings>) {
    state = { ...state, settings: { ...state.settings, ...settings } };
    emitChange();
  },

  submitAssetRequest(
    request: Omit<
      AssetRequest,
      "id" | "requestedAt" | "status" | "progress" | "requestedBy"
    >,
  ) {
    const newRequest: AssetRequest = {
      ...request,
      id: globalThis.crypto.randomUUID(),
      requestedAt: new Date(),
      requestedBy: "user",
      status: "pending",
      progress: 0,
    };
    state = { ...state, assetRequests: [newRequest, ...state.assetRequests] };

    // Add notification
    this.addNotification({
      type: "asset_request",
      title: "Tracking Requested",
      message: `Your request to track ${request.symbol} has been submitted.`,
    });

    // Simulate background processing start after 2 seconds
    setTimeout(() => {
      this.updateAssetRequestStatus(newRequest.id, "processing", 10);
    }, 2000);

    emitChange();
    return newRequest;
  },

  updateAssetRequestStatus(
    id: string,
    status: AssetRequest["status"],
    progress?: number,
  ) {
    const assetRequests = state.assetRequests.map((r) => {
      if (r.id === id) {
        const updated = { ...r, status, progress: progress ?? r.progress };
        if (status === "processing" && !r.estimatedCompletion) {
          updated.estimatedCompletion = new Date(
            Date.now() + 1000 * 60 * 60 * 4,
          ); // 4 hours
        }
        if (status === "approved" || status === "rejected") {
          updated.processedAt = new Date();
          updated.progress = 100;
        }
        return updated;
      }
      return r;
    });
    state = { ...state, assetRequests };
    emitChange();
  },

  updateAssetRequestProgress(id: string, progress: number) {
    const assetRequests = state.assetRequests.map((r) =>
      r.id === id ? { ...r, progress: Math.min(100, progress) } : r,
    );
    state = { ...state, assetRequests };
    emitChange();
  },

  cancelAssetRequest(id: string) {
    const assetRequests = state.assetRequests.filter((r) => r.id !== id);
    state = { ...state, assetRequests };
    emitChange();
  },

  // Admin actions
  approveAssetRequest(id: string, notes?: string) {
    const request = state.assetRequests.find((r) => r.id === id);
    if (!request) return;

    this.updateAssetRequestStatus(id, "approved");

    // Update with notes
    const assetRequests = state.assetRequests.map((r) =>
      r.id === id ? { ...r, adminNotes: notes, processedAt: new Date() } : r,
    );
    state = { ...state, assetRequests };

    // Add notification for user
    this.addNotification({
      type: "asset_request",
      title: "Asset Now Available",
      message: `${request.symbol} is now available for tracking!`,
      assetId: request.symbol.toLowerCase(),
    });

    emitChange();
  },

  rejectAssetRequest(id: string, notes?: string) {
    const request = state.assetRequests.find((r) => r.id === id);
    if (!request) return;

    this.updateAssetRequestStatus(id, "rejected");

    const assetRequests = state.assetRequests.map((r) =>
      r.id === id ? { ...r, adminNotes: notes, processedAt: new Date() } : r,
    );
    state = { ...state, assetRequests };

    this.addNotification({
      type: "asset_request",
      title: "Request Declined",
      message: `Your request to track ${request.symbol} could not be fulfilled.${notes ? ` Reason: ${notes}` : ""}`,
    });

    emitChange();
  },
};

if (typeof window !== "undefined") {
  setInterval(() => {
    const processingRequests = state.assetRequests.filter(
      (r) => r.status === "processing",
    );
    processingRequests.forEach((request) => {
      if (request.progress < 95) {
        portfolioStore.updateAssetRequestProgress(
          request.id,
          request.progress + Math.random() * 5,
        );
      }
    });
  }, 3000);
}

// Hooks
export function usePortfolioStore() {
  return useSyncExternalStore(
    portfolioStore.subscribe,
    portfolioStore.getSnapshot,
    portfolioStore.getServerSnapshot,
  );
}

export function useNotifications() {
  const store = usePortfolioStore();
  const unreadCount = store.notifications.filter((n) => !n.read).length;
  return { notifications: store.notifications, unreadCount };
}

export function useSettings() {
  const store = usePortfolioStore();
  const updateSettings = useCallback((settings: Partial<Settings>) => {
    portfolioStore.updateSettings(settings);
  }, []);
  return { settings: store.settings, updateSettings };
}

export function useAssetRequests() {
  const store = usePortfolioStore();
  const pendingCount = store.assetRequests.filter(
    (r) => r.status === "pending" || r.status === "processing",
  ).length;
  return {
    requests: store.assetRequests,
    pendingCount,
    submitRequest: portfolioStore.submitAssetRequest.bind(portfolioStore),
    cancelRequest: portfolioStore.cancelAssetRequest.bind(portfolioStore),
  };
}
