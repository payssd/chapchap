import { Metadata } from "next";
import Link from "next/link";
import { 
  Search, 
  FileText, 
  CreditCard, 
  Bell, 
  Users, 
  Settings, 
  HelpCircle,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Help Center | ChapChap",
  description: "Find answers to common questions and learn how to use ChapChap effectively.",
};

const categories = [
  {
    icon: FileText,
    title: "Getting Started",
    description: "Learn the basics of creating and sending invoices",
    articles: 8,
    href: "#getting-started",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Payment methods, processing, and troubleshooting",
    articles: 12,
    href: "#payments",
  },
  {
    icon: Bell,
    title: "Reminders",
    description: "Setting up and customizing automatic reminders",
    articles: 6,
    href: "#reminders",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Managing clients and their information",
    articles: 5,
    href: "#clients",
  },
  {
    icon: Settings,
    title: "Account & Settings",
    description: "Profile, billing, and account settings",
    articles: 10,
    href: "#settings",
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    description: "Common issues and how to resolve them",
    articles: 15,
    href: "#troubleshooting",
  },
];

const popularArticles = [
  { title: "How to create your first invoice", category: "Getting Started" },
  { title: "Setting up Paystack integration", category: "Payments" },
  { title: "Customizing reminder messages", category: "Reminders" },
  { title: "Importing clients from CSV", category: "Client Management" },
  { title: "Understanding your billing", category: "Account & Settings" },
  { title: "Why isn't my client receiving reminders?", category: "Troubleshooting" },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FF6B35]/10 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A2332] mb-6">
            How can we <span className="text-[#FF6B35]">help</span>?
          </h1>
          <p className="text-xl text-[#44403C] max-w-2xl mx-auto mb-8">
            Search our knowledge base or browse categories below.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search for help articles..." 
              className="pl-12 h-14 text-lg rounded-xl border-gray-300"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <a
                key={category.title}
                href={category.href}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md hover:border-[#FF6B35]/50 transition-all group"
              >
                <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#FF6B35]/20 transition-colors">
                  <category.icon className="h-6 w-6 text-[#FF6B35]" />
                </div>
                <h3 className="font-display font-semibold text-[#1A2332] mb-2 group-hover:text-[#FF6B35] transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-[#44403C] mb-3">{category.description}</p>
                <p className="text-xs text-gray-500">{category.articles} articles</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8 text-center">
            Popular Articles
          </h2>
          <div className="bg-white rounded-2xl border shadow-sm divide-y">
            {popularArticles.map((article, index) => (
              <a
                key={index}
                href="#"
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <p className="font-medium text-[#1A2332] group-hover:text-[#FF6B35] transition-colors">
                    {article.title}
                  </p>
                  <p className="text-sm text-gray-500">{article.category}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#1A2332] rounded-2xl p-8 text-white">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[#FF6B35]" />
            <h2 className="text-2xl font-display font-bold mb-4">
              Still need help?
            </h2>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <Link href="/contact">
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
