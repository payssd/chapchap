"use client";

import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/format";
import type { Invoice, Client, User } from "@/lib/supabase/database.types";

interface TemplateProps {
  invoice: Invoice;
  client: Client;
  user: User;
}

export function ModernTemplate({ invoice, client, user }: TemplateProps) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    CANCELLED: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B35] to-[#FDB750] p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{user.business_name || "ChapChap Invoice"}</h1>
            <p className="text-white/80 text-sm mt-1">{user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">INVOICE</p>
            <p className="text-xl font-bold">{invoice.invoice_number}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Bill To & Invoice Details */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill To</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{client.name}</p>
            {client.business_name && (
              <p className="text-sm text-gray-600">{client.business_name}</p>
            )}
            {client.email && (
              <p className="text-sm text-gray-600">{client.email}</p>
            )}
            {client.phone_number && (
              <p className="text-sm text-gray-600">{client.phone_number}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice Details</p>
            <div className="mt-1 space-y-1">
              <p className="text-sm">
                <span className="text-gray-500">Issue Date: </span>
                <span className="text-gray-900">{format(new Date(invoice.created_at), "MMM dd, yyyy")}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Due Date: </span>
                <span className="text-gray-900 font-medium">{format(new Date(invoice.due_date), "MMM dd, yyyy")}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Description</span>
            <span className="text-xs font-semibold text-gray-500 uppercase">Amount</span>
          </div>
          <div className="px-4 py-4 flex justify-between items-start">
            <p className="text-gray-700">{invoice.description || "Services rendered"}</p>
            <p className="font-semibold text-gray-900">{formatCurrency(invoice.amount, invoice.currency)}</p>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="bg-orange-50 rounded-lg px-6 py-4 text-right">
            <p className="text-sm text-gray-500">Total Due</p>
            <p className="text-2xl font-bold text-[#FF6B35]">{formatCurrency(invoice.amount, invoice.currency)}</p>
          </div>
        </div>

        {/* Payment Link */}
        {invoice.paystack_payment_link && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700">Payment Instructions</p>
            <p className="text-sm text-gray-500 mt-1">Pay online using the link below:</p>
            <a
              href={invoice.paystack_payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#FF6B35] hover:underline break-all"
            >
              {invoice.paystack_payment_link}
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#1A2332] p-4 text-center">
        <p className="text-white text-sm">Thank you for your business!</p>
        <p className="text-gray-400 text-xs mt-1">Powered by ChapChap</p>
      </div>
    </div>
  );
}
