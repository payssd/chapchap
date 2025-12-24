"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientsTable } from "./ClientsTable";
import { AddClientDialog } from "./AddClientDialog";
import { EditClientDialog } from "./EditClientDialog";
import type { Client } from "@/lib/supabase/database.types";

interface ClientWithOutstanding extends Client {
  total_outstanding: number;
}

interface ClientsPageClientProps {
  initialClients: ClientWithOutstanding[];
}

export function ClientsPageClient({ initialClients }: ClientsPageClientProps) {
  const router = useRouter();
  const [clients, setClients] = useState(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleEdit = useCallback((client: Client) => {
    setClientToEdit(client);
    setEditDialogOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">
            Manage your clients and their information
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>All Clients ({clients.length})</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ClientsTable
            clients={filteredClients}
            onEdit={handleEdit}
            onRefresh={handleRefresh}
          />
        </CardContent>
      </Card>

      <AddClientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleRefresh}
      />

      <EditClientDialog
        client={clientToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
