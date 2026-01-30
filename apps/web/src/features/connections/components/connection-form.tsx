"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useCreateConnection, useValidateConnection } from "../hooks/use-connections";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ExchangeId } from "@workspace/shared-types/api";

interface ConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialExchange?: ExchangeId;
}

const EXCHANGE_OPTIONS = [
  { value: "binance", label: "Binance", icon: "/icons/binance.svg" },
  { value: "okx", label: "OKX", icon: "/icons/okx.svg" }, // Assuming icon exists or fallback
];

export function ConnectionForm({
  isOpen,
  onClose,
  initialExchange = ExchangeId.binance,
}: ConnectionFormProps) {
  const [exchange, setExchange] = useState<string>(initialExchange);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  const createMutation = useCreateConnection();
  const validateMutation = useValidateConnection();

  const handleExchangeChange = (value: string) => {
    setExchange(value);
    setIsValidated(false);
    // Reset specific fields if needed
    if (value !== "okx") {
      setPassphrase("");
    }
  };

  const handleValidate = () => {
    if (!apiKey || !apiSecret) return;
    if (exchange === "okx" && !passphrase) return;

    validateMutation.mutate(
      {
        exchange: exchange as ExchangeId,
        apiKey,
        apiSecret,
        passphrase: exchange === "okx" ? passphrase : undefined,
      },
      {
        onSuccess: (result) => {
          if (result.valid) {
            setIsValidated(true);
          }
        },
      }
    );
  };

  const handleSubmit = () => {
    createMutation.mutate(
      {
        exchange: exchange as ExchangeId,
        apiKey,
        apiSecret,
        passphrase: exchange === "okx" ? passphrase : undefined,
      },
      {
        onSuccess: () => {
          onClose();
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setApiKey("");
    setApiSecret("");
    setPassphrase("");
    setIsValidated(false);
    setShowSecret(false);
    setShowPassphrase(false);
    setExchange(initialExchange);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const selectedExchange = EXCHANGE_OPTIONS.find((e) => e.value === exchange);
  const isOkx = exchange === "okx";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedExchange?.icon && (
              <img
                src={selectedExchange.icon}
                alt={selectedExchange.label}
                className="h-6 w-6"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            Connect {selectedExchange?.label || "Exchange"}
          </DialogTitle>
          <DialogDescription>
            Enter your API credentials. Use <strong>read-only</strong> permissions for security.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="exchange-select">Exchange</Label>
            <Select value={exchange} onValueChange={handleExchangeChange}>
              <SelectTrigger id="exchange-select">
                <SelectValue placeholder="Select Exchange" />
              </SelectTrigger>
              <SelectContent>
                {EXCHANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {/* Placeholder for icon if needed */}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValidated(false);
              }}
              placeholder={`Your ${selectedExchange?.label} API Key`}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <div className="relative">
              <Input
                id="api-secret"
                type={showSecret ? "text" : "password"}
                value={apiSecret}
                onChange={(e) => {
                  setApiSecret(e.target.value);
                  setIsValidated(false);
                }}
                placeholder={`Your ${selectedExchange?.label} API Secret`}
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isOkx && (
            <div className="grid gap-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <div className="relative">
                <Input
                  id="passphrase"
                  type={showPassphrase ? "text" : "password"}
                  value={passphrase}
                  onChange={(e) => {
                    setPassphrase(e.target.value);
                    setIsValidated(false);
                  }}
                  placeholder="Your OKX Passphrase"
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassphrase(!showPassphrase)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Required for OKX API authentication.</p>
            </div>
          )}

          {/* Status Messages */}
          {validateMutation.isPending && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating credentials...
            </div>
          )}

          {isValidated && (
            <div className="flex items-center text-sm text-emerald-500">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Credentials validated successfully!
            </div>
          )}

          {validateMutation.isError && (
            <div className="flex items-center text-sm text-red-500">
              <AlertCircle className="mr-2 h-4 w-4" />
              {validateMutation.error?.message || "Validation failed"}
            </div>
          )}

          {createMutation.isPending && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating connection and syncing balances...
            </div>
          )}

          {/* Security Notice */}
          <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
            <strong>Security Tip:</strong> Create an API key with only &quot;Read-Only&quot;
            permissions. Never grant withdrawal rights.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {!isValidated ? (
            <Button
              onClick={handleValidate}
              disabled={
                !apiKey || !apiSecret || (isOkx && !passphrase) || validateMutation.isPending
              }
            >
              {validateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect & Sync
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
