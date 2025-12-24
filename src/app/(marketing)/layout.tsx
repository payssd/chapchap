import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A2332]">ChapChap</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/enterprise" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Enterprise
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-gradient-to-r from-[#FF6B35] to-[#FDB750] hover:opacity-90">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#1A2332] text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ChapChap</span>
              </div>
              <p className="text-sm text-gray-400">
                Get paid faster with automated invoice reminders and payment tracking.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refunds" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:support@chapchap.app" className="hover:text-white transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} ChapChap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
