"use client";

import { ConnectionDto } from "@workspace/shared-types/api";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Trash2, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useDeleteConnection, useSyncConnection } from "../hooks/use-connections";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { useStaleness } from "@/hooks/use-staleness";
import { cn } from "@workspace/ui/lib/utils";

interface ConnectionCardProps {
  connection: ConnectionDto;
}

const EXCHANGE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  binance: {
    label: "Binance",
    icon: "/icons/binance.svg",
    color: "bg-[#F3BA2F]/10 text-[#F3BA2F]",
  },
  okx: { label: "OKX", icon: "/icons/okx.svg", color: "bg-white/10 text-white" },
};

export function ConnectionCard({ connection }: ConnectionCardProps) {
  const { mutate: deleteConnection, isPending: isDeleting } = useDeleteConnection();
  const { mutate: syncConnection, isPending: isSyncing } = useSyncConnection();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Use staleness hook
  const { isStale, label: stalenessLabel } = useStaleness(connection.lastSyncedAt);

  const handleDelete = () => {
    deleteConnection(connection.id, {
      onSuccess: () => setIsDeleteDialogOpen(false),
    });
  };

  const handleSync = () => {
    if (cooldown || isSyncing) return;

    syncConnection(connection.id, {
      onSuccess: () => {
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000); // 60s cooldown
      },
    });
  };

  const config = EXCHANGE_CONFIG[connection.exchange] || {
    label: connection.exchange,
    icon: "/icons/generic.svg",
    color: "bg-zinc-500/10 text-zinc-500",
  };

  const isActive = connection.status === "active";

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <img
                src={config.icon}
                alt={config.label}
                className="h-5 w-5"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              {config.label}
            </CardTitle>
            <CardDescription className="text-xs font-mono truncate max-w-[150px]">
              {connection.apiKeyMasked}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "border-0 capitalize",
              isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}
          >
            {isActive ? (
              <CheckCircle className="mr-1 h-3 w-3" />
            ) : (
              <AlertCircle className="mr-1 h-3 w-3" />
            )}
            {connection.status}
          </Badge>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex items-center gap-2 text-xs">
            <Clock
              className={cn("h-3.5 w-3.5", isStale ? "text-amber-500" : "text-muted-foreground")}
            />
            <span className={cn(isStale && "text-amber-500 font-medium")}>
              {connection.lastSyncedAt ? `Synced ${stalenessLabel}` : "Never synced"}
            </span>
            {isStale && connection.lastSyncedAt && (
              <Badge
                variant="outline"
                className="ml-auto text-[10px] border-amber-500/20 text-amber-500 px-1 py-0 h-4"
              >
                Stale
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="justify-between pt-2 border-t bg-muted/50 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-red-500 h-8 px-2"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Remove
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={handleSync}
            disabled={isSyncing || cooldown || !isActive}
          >
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : cooldown ? "Synced" : "Sync Now"}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connection to <strong>{config.label}</strong>. Existing portfolio
              data synced from this exchange will NOT be deleted, but no new updates will be
              received.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
