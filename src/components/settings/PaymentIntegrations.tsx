"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  ExternalLink,
  CreditCard,
  Smartphone,
  Star,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { 
  PAYMENT_PROVIDERS, 
  getGatewayProviders, 
  getMobileMoneyProviders,
  getProviderConfig,
  createPaymentProvider,
} from "@/lib/payments";
import type { PaymentIntegration, ProviderConfig, PaymentProvider } from "@/lib/payments/types";
import { toast } from "sonner";

interface PaymentIntegrationsProps {
  userId: string;
}

export function PaymentIntegrations({ userId }: PaymentIntegrationsProps) {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<PaymentIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ProviderConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteIntegration, setDeleteIntegration] = useState<PaymentIntegration | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const gatewayProviders = getGatewayProviders();
  const mobileMoneyProviders = getMobileMoneyProviders();

  useEffect(() => {
    loadIntegrations();
  }, [userId]);

  async function loadIntegrations() {
    setIsLoading(true);
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("payment_integrations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIntegrations(data as PaymentIntegration[]);
    }
    setIsLoading(false);
  }

  function openAddDialog(provider: ProviderConfig) {
    // Check if already integrated
    const existing = integrations.find(i => i.provider === provider.id);
    if (existing) {
      toast.error(`${provider.name} is already integrated`);
      return;
    }
    
    setSelectedProvider(provider);
    setCredentials({});
    setShowPasswords({});
    setIsDialogOpen(true);
  }

  async function handleSaveIntegration() {
    if (!selectedProvider) return;

    // Validate required fields
    const missingFields = selectedProvider.credential_fields
      .filter(f => f.required && !credentials[f.key])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("payment_integrations")
        .insert({
          user_id: userId,
          integration_type: selectedProvider.type,
          provider: selectedProvider.id,
          display_name: selectedProvider.name,
          credentials: credentials,
          supported_currencies: selectedProvider.currencies,
          supported_methods: selectedProvider.supported_methods,
          is_active: true,
          is_default: integrations.length === 0, // First integration is default
          verification_status: "pending",
        });

      if (error) {
        toast.error("Failed to save integration");
        console.error(error);
      } else {
        toast.success(`${selectedProvider.name} integration added`);
        setIsDialogOpen(false);
        loadIntegrations();
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }

    setIsSaving(false);
  }

  async function handleTestConnection() {
    if (!selectedProvider) return;

    setIsTesting(true);

    try {
      const provider = createPaymentProvider(
        selectedProvider.id as PaymentProvider,
        credentials
      );

      const isValid = await provider.verifyCredentials();

      if (isValid) {
        toast.success("Connection successful!");
      } else {
        toast.error("Connection failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("Connection test failed");
      console.error(error);
    }

    setIsTesting(false);
  }

  async function handleToggleActive(integration: PaymentIntegration) {
    const supabase = createClient();

    const { error } = await supabase
      .from("payment_integrations")
      .update({ is_active: !integration.is_active })
      .eq("id", integration.id);

    if (!error) {
      loadIntegrations();
      toast.success(integration.is_active ? "Integration disabled" : "Integration enabled");
    }
  }

  async function handleSetDefault(integration: PaymentIntegration) {
    const supabase = createClient();

    // First, unset all defaults for this type
    await supabase
      .from("payment_integrations")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("integration_type", integration.integration_type);

    // Then set this one as default
    const { error } = await supabase
      .from("payment_integrations")
      .update({ is_default: true })
      .eq("id", integration.id);

    if (!error) {
      loadIntegrations();
      toast.success(`${integration.display_name} set as default`);
    }
  }

  async function handleDeleteIntegration() {
    if (!deleteIntegration) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("payment_integrations")
      .delete()
      .eq("id", deleteIntegration.id);

    if (!error) {
      loadIntegrations();
      toast.success("Integration removed");
    }

    setDeleteIntegration(null);
  }

  function renderProviderCard(provider: ProviderConfig, isIntegrated: boolean) {
    const integration = integrations.find(i => i.provider === provider.id);

    return (
      <Card key={provider.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg flex items-center justify-center">
                {provider.type === "gateway" ? (
                  <CreditCard className="w-5 h-5 text-white" />
                ) : (
                  <Smartphone className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">{provider.name}</CardTitle>
                <CardDescription className="text-xs">
                  {provider.countries.slice(0, 3).join(", ")}
                  {provider.countries.length > 3 && ` +${provider.countries.length - 3}`}
                </CardDescription>
              </div>
            </div>
            {isIntegrated ? (
              <Badge variant={integration?.is_active ? "default" : "secondary"}>
                {integration?.is_active ? "Active" : "Inactive"}
              </Badge>
            ) : (
              <Badge variant="outline">Not Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            {provider.description}
          </p>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {provider.supported_methods.map(method => (
              <Badge key={method} variant="secondary" className="text-xs">
                {method}
              </Badge>
            ))}
          </div>

          {isIntegrated && integration ? (
            <div className="flex items-center gap-2">
              <Switch
                checked={integration.is_active}
                onCheckedChange={() => handleToggleActive(integration)}
              />
              <span className="text-sm text-muted-foreground">
                {integration.is_active ? "Enabled" : "Disabled"}
              </span>
              {integration.is_default && (
                <Badge variant="outline" className="ml-auto">
                  <Star className="w-3 h-3 mr-1" />
                  Default
                </Badge>
              )}
              {!integration.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => handleSetDefault(integration)}
                >
                  Set Default
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => setDeleteIntegration(integration)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => openAddDialog(provider)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Connect
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a href={provider.docs_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Docs
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium">
            {integrations.filter(i => i.is_active).length} Active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium">
            {integrations.filter(i => !i.is_active).length} Inactive
          </span>
        </div>
      </div>

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gateways" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payment Gateways
          </TabsTrigger>
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Mobile Money
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {gatewayProviders.map(provider => 
              renderProviderCard(
                provider, 
                integrations.some(i => i.provider === provider.id)
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {mobileMoneyProviders.map(provider => 
              renderProviderCard(
                provider, 
                integrations.some(i => i.provider === provider.id)
              )
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Integration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect {selectedProvider?.name}.
              {selectedProvider?.signup_url && (
                <>
                  {" "}Don&apos;t have an account?{" "}
                  <a 
                    href={selectedProvider.signup_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Sign up here
                  </a>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedProvider?.credential_fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {field.type === "select" ? (
                  <Select
                    value={credentials[field.key] || ""}
                    onValueChange={(value) => 
                      setCredentials(prev => ({ ...prev, [field.key]: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="relative">
                    <Input
                      id={field.key}
                      type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                      placeholder={field.placeholder}
                      value={credentials[field.key] || ""}
                      onChange={(e) => 
                        setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                    {field.type === "password" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => 
                          setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))
                        }
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                )}
                
                {field.help_text && (
                  <p className="text-xs text-muted-foreground">{field.help_text}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>
            <Button
              onClick={handleSaveIntegration}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Save Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteIntegration} onOpenChange={() => setDeleteIntegration(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Integration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {deleteIntegration?.display_name}? 
              This will disable payments through this provider for all invoices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIntegration}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
