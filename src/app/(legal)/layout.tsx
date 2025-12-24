import Link from "next/link";
import { FileText } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A2332]">ChapChap</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChapChap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
