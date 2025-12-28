/**
 * Connections Settings Page
 * Story: 2.7 Connection Settings
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ExchangeId, type ConnectionDto } from '@repo/api-types';
import { useConnections, useDeleteConnection } from '@/api/hooks/use-connections';
import { IntegrationCard, ConnectionModal } from '@/components/connections';
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';

export default function ConnectionsSettingsPage() {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId | null>(null);
  const [deleteConnectionId, setDeleteConnectionId] = useState<string | null>(null);
  
  const { data: connections, isLoading, error } = useConnections();
  const deleteMutation = useDeleteConnection();

  // All supported exchanges
  const exchanges: ExchangeId[] = [ExchangeId.BINANCE, ExchangeId.OKX];

  // Map connections by exchange for quick lookup
  const connectionsByExchange = (connections?.reduce((acc, conn) => {
    acc[conn.exchange] = conn;
    return acc;
  }, {} as Record<ExchangeId, ConnectionDto>) ?? {}) as Record<ExchangeId, ConnectionDto>;

  const handleConnect = (exchange: ExchangeId) => {
    setSelectedExchange(exchange);
  };

  const handleDisconnect = (connectionId: string) => {
    setDeleteConnectionId(connectionId);
  };

  const confirmDelete = async () => {
    if (!deleteConnectionId) return;
    
    try {
      await deleteMutation.mutateAsync(deleteConnectionId);
    } finally {
      setDeleteConnectionId(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-3">
          <Link to="/settings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Exchange Connections</h1>
        <p className="text-muted-foreground mt-2">
          Connect your crypto exchange accounts to automatically sync your portfolio balances.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive mb-6">
          Failed to load connections: {error.message}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Connections Grid */}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {exchanges.map((exchange) => (
            <IntegrationCard
              key={exchange}
              exchange={exchange}
              connection={connectionsByExchange[exchange]}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              isLoading={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 rounded-lg border border-muted bg-muted/30 p-4">
        <h3 className="font-medium text-sm mb-2">🔒 Security Note</h3>
        <p className="text-sm text-muted-foreground">
          Your API credentials are encrypted at rest using industry-standard AES-256-GCM encryption.
          We recommend using read-only API keys with IP restrictions for maximum security.
          Your API secret is never displayed after saving.
        </p>
      </div>

      {/* Connection Modal */}
      <ConnectionModal
        exchange={selectedExchange}
        open={!!selectedExchange}
        onOpenChange={(open) => !open && setSelectedExchange(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConnectionId} onOpenChange={() => setDeleteConnectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Exchange?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your API credentials and stop automatic syncing.
              You can reconnect at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
