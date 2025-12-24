"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoicesTable } from "./InvoicesTable";
import type { Invoice, Client } from "@/lib/supabase/database.types";

type InvoiceWithClient = Invoice & {
  clients: Pick<Client, "name" | "email"> | null;
};

interface InvoicesPageClientProps {
  initialInvoices: InvoiceWithClient[];
}

export function InvoicesPageClient({ initialInvoices }: InvoicesPageClientProps) {
  const router = useRouter();
  const [invoices] = useState(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const statusCounts = {
    all: invoices.length,
    DRAFT: invoices.filter((i) => i.status === "DRAFT").length,
    SENT: invoices.filter((i) => i.status === "SENT").length,
    PAID: invoices.filter((i) => i.status === "PAID").length,
    OVERDUE: invoices.filter((i) => i.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track your invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Invoices ({invoices.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({statusCounts.all})</SelectItem>
                  <SelectItem value="DRAFT">Draft ({statusCounts.DRAFT})</SelectItem>
                  <SelectItem value="SENT">Sent ({statusCounts.SENT})</SelectItem>
                  <SelectItem value="PAID">Paid ({statusCounts.PAID})</SelectItem>
                  <SelectItem value="OVERDUE">Overdue ({statusCounts.OVERDUE})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InvoicesTable invoices={filteredInvoices} onRefresh={handleRefresh} />
        </CardContent>
      </Card>
    </div>
  );
}
