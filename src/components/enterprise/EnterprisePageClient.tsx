"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  Shield,
  Globe,
  Headphones,
  Code,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const enterpriseFeatures = [
  {
    icon: Users,
    title: "Multi-User Access",
    description: "Invite your entire team with role-based permissions and access controls.",
  },
  {
    icon: Shield,
    title: "Advanced Security",
    description: "Enterprise-grade security with SSO, audit logs, and compliance features.",
  },
  {
    icon: Globe,
    title: "White-Label Branding",
    description: "Remove ChapChap branding and use your own logo, colors, and domain.",
  },
  {
    icon: Code,
    title: "API Access",
    description: "Full API access to integrate ChapChap with your existing systems.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Get a dedicated account manager and priority support with SLA guarantee.",
  },
  {
    icon: Building2,
    title: "Custom Integrations",
    description: "We'll build custom integrations tailored to your business needs.",
  },
];

const includedFeatures = [
  "Everything in Professional",
  "Unlimited team members",
  "Role-based permissions",
  "Client portal access",
  "White-label branding",
  "Custom domain",
  "API access",
  "Dedicated account manager",
  "Custom integrations",
  "SLA guarantee",
  "Priority support",
  "Training sessions",
];

export function EnterprisePageClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/enterprise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting inquiry:", error);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="py-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
          <Building2 className="h-4 w-4" />
          Enterprise Solutions
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A2332] mb-4">
          Built for teams that need more
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get custom solutions, dedicated support, and enterprise-grade features
          tailored to your organization's needs.
        </p>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {enterpriseFeatures.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="container mx-auto px-4 mb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Left - What's Included */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Everything you need</h2>
            <p className="text-muted-foreground mb-6">
              Enterprise plans include all Professional features plus dedicated
              enterprise capabilities.
            </p>
            <ul className="space-y-3">
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Contact Form */}
          <div>
            <Card>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Thank you!</h3>
                    <p className="text-muted-foreground mb-6">
                      We've received your inquiry and will get back to you within
                      24 hours.
                    </p>
                    <Link href="/pricing">
                      <Button variant="outline">
                        View Pricing
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-4">Contact Sales</h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Fill out the form and we'll get back to you within 24 hours.
                    </p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Work Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Company *</Label>
                          <Input
                            id="company"
                            required
                            value={formData.company}
                            onChange={(e) =>
                              setFormData({ ...formData, company: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="teamSize">Team Size</Label>
                          <Select
                            value={formData.teamSize}
                            onValueChange={(value) =>
                              setFormData({ ...formData, teamSize: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1-10">1-10</SelectItem>
                              <SelectItem value="11-50">11-50</SelectItem>
                              <SelectItem value="51-200">51-200</SelectItem>
                              <SelectItem value="201-500">201-500</SelectItem>
                              <SelectItem value="500+">500+</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">How can we help?</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder="Tell us about your needs..."
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FDB750]"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Get in Touch"
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-[#1A2332] rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Not ready for Enterprise?</h2>
          <p className="text-lg opacity-90 mb-8">
            Start with our Professional plan and upgrade when you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View All Plans
              </Button>
            </Link>
            <Link href="/signup?plan=professional">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#FF6B35] to-[#FDB750] text-white"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
