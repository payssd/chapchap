"use client";

import { useState, useEffect } from "react";
import { CreditCard, Smartphone, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { PaymentIntegration } from "@/lib/payments/types";
import { getProviderConfig } from "@/lib/payments";

interface PaymentMethodSelectorProps {
  userId: string;
  selectedIntegrations: string[];
  onSelectionChange: (integrationIds: string[]) => void;
  defaultIntegrationId?: string;
  onDefaultChange?: (integrationId: string) => void;
}

export function PaymentMethodSelector({
  userId,
  selectedIntegrations,
  onSelectionChange,
  defaultIntegrationId,
  onDefaultChange,
}: PaymentMethodSelectorProps) {
  const [integrations, setIntegrations] = useState<PaymentIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIntegrations() {
      const supabase = createClient();
      
      const { data } = await supabase
        .from("payment_integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("is_default", { ascending: false });

      if (data) {
        setIntegrations(data as PaymentIntegration[]);
        
        // Auto-select default integration if none selected
        if (selectedIntegrations.length === 0 && data.length > 0) {
          const defaultInt = data.find(i => i.is_default) || data[0];
          onSelectionChange([defaultInt.id]);
          if (onDefaultChange) {
            onDefaultChange(defaultInt.id);
          }
        }
      }
      setIsLoading(false);
    }

    loadIntegrations();
  }, [userId]);

  function handleToggle(integrationId: string) {
    if (selectedIntegrations.includes(integrationId)) {
      // Don't allow deselecting the last one
      if (selectedIntegrations.length > 1) {
        const newSelection = selectedIntegrations.filter(id => id !== integrationId);
        onSelectionChange(newSelection);
        
        // If we're removing the default, set a new default
        if (defaultIntegrationId === integrationId && onDefaultChange) {
          onDefaultChange(newSelection[0]);
        }
      }
    } else {
      onSelectionChange([...selectedIntegrations, integrationId]);
    }
  }

  function handleSetDefault(integrationId: string) {
    if (onDefaultChange && selectedIntegrations.includes(integrationId)) {
      onDefaultChange(integrationId);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Payment Methods</Label>
        <div className="animate-pulse space-y-2">
          <div className="h-16 bg-muted rounded-lg" />
          <div className="h-16 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (integrations.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Payment Methods</Label>
        <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
          <p className="text-sm">No payment methods configured.</p>
          <p className="text-xs mt-1">
            Go to Settings → Payments to add payment integrations.
          </p>
        </div>
      </div>
    );
  }

  const gateways = integrations.filter(i => i.integration_type === "gateway");
  const mobileMoney = integrations.filter(i => i.integration_type === "mobile_money");

  return (
    <div className="space-y-4">
      <Label>Payment Methods</Label>
      <p className="text-sm text-muted-foreground">
        Select which payment options to offer on this invoice
      </p>

      {gateways.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CreditCard className="w-4 h-4" />
            Payment Gateways
          </div>
          <div className="space-y-2">
            {gateways.map(integration => {
              const config = getProviderConfig(integration.provider);
              const isSelected = selectedIntegrations.includes(integration.id);
              const isDefault = defaultIntegrationId === integration.id;

              return (
                <div
                  key={integration.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={integration.id}
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(integration.id)}
                    />
                    <div>
                      <label
                        htmlFor={integration.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {integration.display_name || config?.name}
                      </label>
                      <div className="flex gap-1 mt-1">
                        {integration.supported_methods.slice(0, 3).map(method => (
                          <Badge key={method} variant="secondary" className="text-xs">
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(integration.id)}
                      className={`text-xs px-2 py-1 rounded ${
                        isDefault
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {isDefault ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Default
                        </span>
                      ) : (
                        "Set Default"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mobileMoney.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Smartphone className="w-4 h-4" />
            Mobile Money
          </div>
          <div className="space-y-2">
            {mobileMoney.map(integration => {
              const config = getProviderConfig(integration.provider);
              const isSelected = selectedIntegrations.includes(integration.id);
              const isDefault = defaultIntegrationId === integration.id;

              return (
                <div
                  key={integration.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isSelected ? "border-primary bg-primary/5" : "border-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={integration.id}
                      checked={isSelected}
                      onCheckedChange={() => handleToggle(integration.id)}
                    />
                    <div>
                      <label
                        htmlFor={integration.id}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {integration.display_name || config?.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {config?.countries.join(", ")}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(integration.id)}
                      className={`text-xs px-2 py-1 rounded ${
                        isDefault
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {isDefault ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Default
                        </span>
                      ) : (
                        "Set Default"
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
