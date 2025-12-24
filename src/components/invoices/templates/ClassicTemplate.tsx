"use client";

import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/format";
import type { Invoice, Client, User } from "@/lib/supabase/database.types";

interface TemplateProps {
  invoice: Invoice;
  client: Client;
  user: User;
}

export function ClassicTemplate({ invoice, client, user }: TemplateProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2332]">INVOICE</h1>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-[#1A2332]">{user.business_name || "Your Business"}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          {user.phone_number && <p className="text-sm text-gray-500">{user.phone_number}</p>}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8 py-6">
        <div className="space-y-2">
          <div className="flex">
            <span className="w-32 text-gray-500">Invoice Number:</span>
            <span className="font-semibold">{invoice.invoice_number}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Issue Date:</span>
            <span>{format(new Date(invoice.created_at), "MMMM dd, yyyy")}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Due Date:</span>
            <span>{format(new Date(invoice.due_date), "MMMM dd, yyyy")}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-gray-500">Status:</span>
            <span className="font-medium">{invoice.status}</span>
          </div>
        </div>

        <div>
          <p className="text-gray-500 font-medium mb-2">Bill To:</p>
          <p className="font-semibold text-lg">{client.name}</p>
          {client.business_name && <p className="text-gray-600">{client.business_name}</p>}
          {client.email && <p className="text-gray-600">{client.email}</p>}
          {client.phone_number && <p className="text-gray-600">{client.phone_number}</p>}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Description</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-4 py-4 text-gray-700">{invoice.description || "Services rendered"}</td>
              <td className="px-4 py-4 text-right font-medium">{formatCurrency(invoice.amount, invoice.currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mt-4">
        <div className="w-64">
          <div className="flex justify-between py-2 border-t border-gray-300">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold">{formatCurrency(invoice.amount, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Payment Link */}
      {invoice.paystack_payment_link && (
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500">Payment Link:</p>
          <a
            href={invoice.paystack_payment_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B35] hover:underline break-all"
          >
            {invoice.paystack_payment_link}
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-gray-500">Thank you for your business!</p>
      </div>
    </div>
  );
}
