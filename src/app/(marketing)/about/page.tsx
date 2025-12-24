import { Metadata } from "next";
import Link from "next/link";
import { Zap, Target, Heart, Users, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | ChapChap",
  description: "Learn about ChapChap - the automated payment reminder platform helping businesses get paid faster.",
};

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're on a mission to help businesses improve their cash flow and reduce payment delays.",
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Every feature we build starts with understanding our customers' real challenges.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in building a community of successful businesses that support each other.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Serving businesses worldwide with localized payment solutions.",
    },
  ];

  const stats = [
    { value: "1,000+", label: "Active Businesses" },
    { value: "$2M+", label: "Payments Processed" },
    { value: "95%", label: "Collection Rate" },
    { value: "12 Days", label: "Avg. Payment Time" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FF6B35]/10 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 rounded-full text-sm font-medium text-[#FF6B35] mb-6">
            <Zap className="h-4 w-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A2332] mb-6">
            Making Payments <span className="text-[#FF6B35]">Effortless</span>
          </h1>
          <p className="text-xl text-[#44403C] max-w-2xl mx-auto">
            ChapChap was born from a simple frustration: businesses spending too much time 
            chasing payments instead of growing. We built the solution we wished existed.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#1A2332]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-display font-bold text-[#FF6B35] mb-2">{stat.value}</p>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-[#1A2332] mb-8 text-center">
            Our Journey
          </h2>
          <div className="prose prose-lg max-w-none text-[#44403C]">
            <p>
              ChapChap started in 2023 when our founders, frustrated by the endless cycle of 
              payment follow-ups, decided there had to be a better way. As small business owners 
              themselves, they understood the pain of outstanding invoices and the awkwardness 
              of chasing clients for payment.
            </p>
            <p>
              We built ChapChap to automate the entire payment reminder process - from sending 
              professional invoices to following up with gentle reminders via SMS, email, and 
              WhatsApp. Our integration with Paystack means clients can pay instantly with 
              M-Pesa, cards, or bank transfers.
            </p>
            <p>
              Today, ChapChap helps thousands of businesses across the globe get paid faster, 
              reduce payment delays, and maintain better client relationships. We're just 
              getting started.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-[#1A2332] mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-[#FF6B35]" />
                </div>
                <h3 className="text-lg font-display font-semibold text-[#1A2332] mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-[#44403C]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-[#1A2332] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[#44403C] mb-8">
            Join thousands of businesses that trust ChapChap for their payment collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-[#1A2332] text-[#1A2332] px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
