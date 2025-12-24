"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ModernTemplate, ClassicTemplate, MinimalTemplate } from "@/components/invoices/templates";
import type { Invoice, Client, User } from "@/lib/supabase/database.types";

interface TemplateSettingsProps {
  userId: string;
  currentTemplate: string;
}

const sampleInvoice: Invoice = {
  id: "sample",
  user_id: "sample",
  client_id: "sample",
  invoice_number: "INV-001",
  amount: 15000,
  currency: "KES",
  description: "Web Development Services",
  due_date: new Date().toISOString(),
  status: "SENT",
  paystack_payment_link: "https://paystack.com/pay/sample",
  paystack_reference: null,
  paid_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const sampleClient: Client = {
  id: "sample",
  user_id: "sample",
  name: "John Doe",
  email: "john@example.com",
  phone_number: "+254 700 000 000",
  business_name: "Acme Corp",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const sampleUser: User = {
  id: "sample",
  email: "business@example.com",
  business_name: "Your Business Name",
  phone_number: "+254 700 000 000",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and colorful with gradient header",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional professional layout",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant design",
  },
];

export function TemplateSettings({ userId, currentTemplate }: TemplateSettingsProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate || "modern");
  const [isSaving, setIsSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    const supabase = createClient();

    await supabase
      .from("user_settings")
      .upsert({
        user_id: userId,
        invoice_template: selectedTemplate,
      });

    setIsSaving(false);
    router.refresh();
  }

  const renderPreview = (templateId: string) => {
    switch (templateId) {
      case "classic":
        return <ClassicTemplate invoice={sampleInvoice} client={sampleClient} user={sampleUser} />;
      case "minimal":
        return <MinimalTemplate invoice={sampleInvoice} client={sampleClient} user={sampleUser} />;
      case "modern":
      default:
        return <ModernTemplate invoice={sampleInvoice} client={sampleClient} user={sampleUser} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? "ring-2 ring-primary border-primary"
                : ""
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="p-1 bg-primary rounded-full">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <Button
                variant="link"
                size="sm"
                className="mt-2 p-0 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewTemplate(template.id);
                }}
              >
                Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || selectedTemplate === currentTemplate}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Template
        </Button>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="transform scale-75 origin-top">
              {renderPreview(previewTemplate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
