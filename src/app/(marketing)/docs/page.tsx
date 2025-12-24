import { Metadata } from "next";
import Link from "next/link";
import { 
  Code, 
  Key, 
  Webhook, 
  FileJson, 
  ArrowRight,
  Terminal,
  Book,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "API Documentation | ChapChap",
  description: "ChapChap API documentation for developers.",
};

const apiSections = [
  {
    icon: Key,
    title: "Authentication",
    description: "Learn how to authenticate your API requests using API keys.",
  },
  {
    icon: FileJson,
    title: "Invoices API",
    description: "Create, read, update, and delete invoices programmatically.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Receive real-time notifications for payment events.",
  },
  {
    icon: Code,
    title: "SDKs & Libraries",
    description: "Official SDKs for popular programming languages.",
  },
];

const codeExample = `// Create an invoice using the ChapChap API
const response = await fetch('https://api.chapchap.io/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    client_id: 'client_123',
    amount: 5000,
    currency: 'USD',
    due_date: '2024-12-31',
    items: [
      { description: 'Web Development', quantity: 1, rate: 5000 }
    ]
  })
});

const invoice = await response.json();
console.log('Invoice created:', invoice.id);`;

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1A2332] to-[#2a3a4f]">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium text-white mb-6">
            <Terminal className="h-4 w-4" />
            Developer Documentation
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">
            ChapChap <span className="text-[#FF6B35]">API</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Integrate ChapChap into your applications with our powerful REST API.
            Create invoices, manage clients, and automate payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8">
              <Book className="mr-2 h-4 w-4" />
              Read the Docs
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[#1A2332] px-8">
              <Zap className="mr-2 h-4 w-4" />
              Quick Start
            </Button>
          </div>
        </div>
      </section>

      {/* API Sections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8 text-center">
            API Reference
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {apiSections.map((section) => (
              <div
                key={section.title}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md hover:border-[#FF6B35]/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#1A2332] rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-6 w-6 text-[#FF6B35]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[#1A2332] mb-2 group-hover:text-[#FF6B35] transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-[#44403C]">{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8 text-center">
            Quick Example
          </h2>
          <div className="bg-[#1A2332] rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-black/20">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-sm text-gray-400">JavaScript</span>
            </div>
            <pre className="p-6 overflow-x-auto">
              <code className="text-sm text-gray-300 font-mono whitespace-pre">
                {codeExample}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Enterprise API */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FDB750]/10 rounded-2xl p-8">
            <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-4">
              Need Enterprise API Access?
            </h2>
            <p className="text-[#44403C] mb-6 max-w-lg mx-auto">
              Get higher rate limits, dedicated support, and custom integrations 
              with our Enterprise API plan.
            </p>
            <Link href="/enterprise">
              <Button className="bg-[#1A2332] hover:bg-[#1A2332]/90 text-white px-8">
                Contact Sales
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-yellow-50 border-t border-yellow-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-yellow-800">
            <strong>Note:</strong> Full API documentation is coming soon. 
            <Link href="/contact" className="text-[#FF6B35] hover:underline ml-1">
              Contact us
            </Link> for early access.
          </p>
        </div>
      </section>
    </div>
  );
}
