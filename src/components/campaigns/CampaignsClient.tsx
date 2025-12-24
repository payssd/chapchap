"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  Users,
  BarChart3,
  Trash2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { Campaign, Invoice, Client } from "@/lib/supabase/database.types";

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  filter_status: z.enum(["all", "SENT", "OVERDUE"]),
  message_template: z.string().min(1, "Message template is required"),
  send_immediately: z.boolean().default(true),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignsClientProps {
  campaigns: Campaign[];
  invoices: (Invoice & {
    clients: { name: string; email: string | null; phone_number: string | null } | null;
  })[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  SENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  DRAFT: <Clock className="h-3 w-3" />,
  SCHEDULED: <Clock className="h-3 w-3" />,
  SENDING: <Loader2 className="h-3 w-3 animate-spin" />,
  SENT: <CheckCircle className="h-3 w-3" />,
  FAILED: <AlertCircle className="h-3 w-3" />,
};

export function CampaignsClient({ campaigns, invoices }: CampaignsClientProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      filter_status: "all",
      message_template: `Hi {client_name},

This is a friendly reminder that invoice {invoice_number} for {amount} is {status}.

Please make payment at your earliest convenience using the link below:
{payment_link}

Thank you for your business!`,
      send_immediately: true,
    },
  });

  const filterStatus = form.watch("filter_status");

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus === "all") return true;
    return inv.status === filterStatus;
  });

  const recipientCount = filteredInvoices.filter(
    (inv) => inv.clients?.email || inv.clients?.phone_number
  ).length;

  async function onSubmit(data: CampaignFormValues) {
    setIsLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    const filterCriteria = {
      status: data.filter_status === "all" ? ["SENT", "OVERDUE"] : [data.filter_status],
    };

    const { error } = await supabase.from("campaigns").insert({
      user_id: user.id,
      name: data.name,
      filter_criteria: filterCriteria,
      message_template: data.message_template,
      status: data.send_immediately ? "SENDING" : "DRAFT",
      scheduled_at: data.send_immediately ? new Date().toISOString() : null,
      metrics: { sent: 0, opened: 0, clicked: 0, paid: 0 },
    });

    if (!error && data.send_immediately) {
      // In a real implementation, this would trigger the actual sending
      // For now, we'll just mark it as sent after a delay
      setTimeout(async () => {
        await supabase
          .from("campaigns")
          .update({
            status: "SENT",
            sent_at: new Date().toISOString(),
            metrics: { sent: recipientCount, opened: 0, clicked: 0, paid: 0 },
          })
          .eq("name", data.name)
          .eq("user_id", user.id);
        router.refresh();
      }, 2000);
    }

    setIsLoading(false);
    setIsDialogOpen(false);
    form.reset();
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;

    const supabase = createClient();
    await supabase.from("campaigns").delete().eq("id", deleteId);

    setDeleteId(null);
    router.refresh();
  }

  const getMetrics = (campaign: Campaign) => {
    const metrics = campaign.metrics as { sent?: number; opened?: number; clicked?: number; paid?: number } | null;
    return {
      sent: metrics?.sent || 0,
      opened: metrics?.opened || 0,
      clicked: metrics?.clicked || 0,
      paid: metrics?.paid || 0,
    };
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Campaigns
            </CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sent
            </CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + getMetrics(c).sent, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payments Received
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce((sum, c) => sum + getMetrics(c).paid, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Invoices
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Campaigns</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Reminder Campaign</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., December Overdue Reminders" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="filter_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Invoices</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Outstanding</SelectItem>
                            <SelectItem value="SENT">Sent (Not Overdue)</SelectItem>
                            <SelectItem value="OVERDUE">Overdue Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {recipientCount} recipients will receive this campaign
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message_template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message Template *</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[150px] font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Available variables: {"{client_name}"}, {"{invoice_number}"}, {"{amount}"}, {"{status}"}, {"{payment_link}"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading || recipientCount === 0}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No campaigns created yet.</p>
              <p className="text-sm">Create a campaign to send bulk reminders.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const metrics = getMetrics(campaign);
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <p className="font-medium">{campaign.name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[campaign.status]}>
                          <span className="flex items-center gap-1">
                            {statusIcons[campaign.status]}
                            {campaign.status}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>{metrics.sent}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{metrics.paid}</span>
                      </TableCell>
                      <TableCell>
                        {campaign.sent_at
                          ? format(new Date(campaign.sent_at), "MMM dd, yyyy")
                          : format(new Date(campaign.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewCampaign(campaign)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => setDeleteId(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewCampaign} onOpenChange={() => setPreviewCampaign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewCampaign?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Message Template</p>
              <pre className="mt-2 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {previewCampaign?.message_template}
              </pre>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{getMetrics(previewCampaign!).sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{getMetrics(previewCampaign!).opened}</p>
                <p className="text-xs text-muted-foreground">Opened</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{getMetrics(previewCampaign!).clicked}</p>
                <p className="text-xs text-muted-foreground">Clicked</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {getMetrics(previewCampaign!).paid}
                </p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
