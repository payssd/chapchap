import { Metadata } from "next";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Careers | ChapChap",
  description: "Join the ChapChap team and help businesses get paid faster.",
};

const openPositions = [
  {
    id: 1,
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "Remote / Nairobi",
    type: "Full-time",
  },
  {
    id: 2,
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    id: 3,
    title: "Customer Success Manager",
    department: "Customer Success",
    location: "Nairobi",
    type: "Full-time",
  },
  {
    id: 4,
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote / Nairobi",
    type: "Full-time",
  },
];

const benefits = [
  {
    icon: Heart,
    title: "Health & Wellness",
    description: "Comprehensive health insurance for you and your family.",
  },
  {
    icon: Zap,
    title: "Flexible Work",
    description: "Work from anywhere with flexible hours that suit your lifestyle.",
  },
  {
    icon: Users,
    title: "Great Team",
    description: "Join a diverse, talented team passionate about making an impact.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FF6B35]/10 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 rounded-full text-sm font-medium text-[#FF6B35] mb-6">
            <Briefcase className="h-4 w-4" />
            Join Our Team
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A2332] mb-6">
            Build the Future of <span className="text-[#FF6B35]">Payments</span>
          </h1>
          <p className="text-xl text-[#44403C] max-w-2xl mx-auto">
            We&apos;re on a mission to help businesses get paid faster. Join us and 
            make a real impact on how businesses manage their finances.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-8 text-center">
            Why Work With Us
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white p-6 rounded-2xl border shadow-sm text-center">
                <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="h-6 w-6 text-[#FF6B35]" />
                </div>
                <h3 className="font-display font-semibold text-[#1A2332] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#44403C]">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-display font-bold text-[#1A2332] mb-8 text-center">
            Open Positions
          </h2>
          
          <div className="space-y-4">
            {openPositions.map((position) => (
              <div 
                key={position.id}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-display font-semibold text-[#1A2332] mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#44403C]">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <Link href="/contact">
                    <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* No positions message */}
          <div className="mt-12 text-center bg-gray-50 p-8 rounded-2xl">
            <p className="text-[#44403C] mb-4">
              Don&apos;t see a role that fits? We&apos;re always looking for talented people.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium"
            >
              Send us your resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
