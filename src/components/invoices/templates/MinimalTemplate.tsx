"use client";

import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/format";
import type { Invoice, Client, User } from "@/lib/supabase/database.types";

interface TemplateProps {
  invoice: Invoice;
  client: Client;
  user: User;
}

export function MinimalTemplate({ invoice, client, user }: TemplateProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400">{user.business_name || "Invoice"}</p>
        <h1 className="text-4xl font-bold text-[#1A2332] mt-1">{invoice.invoice_number}</h1>
        <p className="text-sm text-gray-400 mt-1">{invoice.status}</p>
      </div>

      {/* Dates */}
      <div className="flex justify-between text-sm text-gray-500 mb-8">
        <span>Issued: {format(new Date(invoice.created_at), "MMM dd, yyyy")}</span>
        <span>Due: {format(new Date(invoice.due_date), "MMM dd, yyyy")}</span>
      </div>

      {/* Client */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Billed to</p>
        <p className="text-lg font-semibold text-[#1A2332] mt-1">{client.name}</p>
        {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
        {client.phone_number && <p className="text-sm text-gray-500">{client.phone_number}</p>}
      </div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Description</p>
        <p className="text-gray-700 mt-1">{invoice.description || "Services"}</p>
      </div>

      {/* Amount */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Amount Due</p>
        <p className="text-4xl font-bold text-[#FF6B35] mt-1">
          {formatCurrency(invoice.amount, invoice.currency)}
        </p>
      </div>

      {/* Payment Link */}
      {invoice.paystack_payment_link && (
        <div className="pt-6 border-t">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Pay online</p>
          <a
            href={invoice.paystack_payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B35] hover:underline break-all text-sm mt-1 block"
          >
            {invoice.paystack_payment_link}
          </a>
        </div>
      )}
    </div>
  );
}
