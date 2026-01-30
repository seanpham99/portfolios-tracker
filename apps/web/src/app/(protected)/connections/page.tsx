"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Plus, RefreshCw, Link as LinkIcon, ShieldCheck, Activity } from "lucide-react";
import { useConnections } from "@/features/connections/hooks/use-connections";
import { ConnectionForm } from "@/features/connections/components/connection-form";
import { ConnectionCard } from "@/features/connections/components/connection-card";
import { Card } from "@workspace/ui/components/card";

export default function ConnectionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: connections, isLoading, refetch, isRefetching } = useConnections();

  return (
    <div className="space-y-8 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-3xl font-bold font-sans tracking-tight">Connections</h3>
          <p className="text-muted-foreground">
            Manage your external API integrations and sync status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Connection
          </Button>
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : !connections || connections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-xl bg-muted/5">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <LinkIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connect Your Accounts</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Connect your exchange accounts to automatically sync holdings, transactions, and
            performance data. We support <strong>Binance</strong> and <strong>OKX</strong> with
            read-only permissions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 w-full max-w-2xl text-left">
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-background border">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <span className="font-medium text-sm">Secure & Read-Only</span>
              <span className="text-xs text-muted-foreground">
                We encrypt your keys and never ask for withdrawal permissions.
              </span>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-background border">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-sm">Real-time Sync</span>
              <span className="text-xs text-muted-foreground">
                Balances are synced automatically on login and manual refresh.
              </span>
            </div>
            <div className="flex flex-col gap-2 p-4 rounded-lg bg-background border">
              <RefreshCw className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-sm">Auto-Reconciliation</span>
              <span className="text-xs text-muted-foreground">
                Transactions are matched against portfolio snapshots.
              </span>
            </div>
          </div>

          <Button size="lg" onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Exchange
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((conn) => (
            <ConnectionCard key={conn.id} connection={conn} />
          ))}

          {/* Add New Card */}
          <Card
            className="flex flex-col items-center justify-center p-6 border-dashed hover:border-primary/50 hover:bg-muted/5 transition-colors cursor-pointer min-h-[200px]"
            onClick={() => setIsFormOpen(true)}
          >
            <div className="bg-muted p-3 rounded-full mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">Add Connection</p>
          </Card>
        </div>
      )}

      <ConnectionForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
