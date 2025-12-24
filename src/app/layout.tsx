import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChapChap - Get Paid Chapchap",
  description: "Automated payment reminders for businesses worldwide. Send invoices, get paid via M-Pesa & cards, and never chase a payment again.",
  keywords: ["invoicing", "payment reminders", "M-Pesa", "Paystack", "SME", "payment collection"],
  authors: [{ name: "ChapChap" }],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "ChapChap - Get Paid Chapchap",
    description: "Automated payment reminders for businesses worldwide",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <ToastProvider />
      </body>
    </html>
  );
}
