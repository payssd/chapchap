"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@chapchap.io",
      href: "mailto:hello@chapchap.io",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+254 700 000 000",
      href: "tel:+254700000000",
    },
    {
      icon: MapPin,
      title: "Office",
      value: "Nairobi, Kenya",
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FF6B35]/10 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 rounded-full text-sm font-medium text-[#FF6B35] mb-6">
            <MessageSquare className="h-4 w-4" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A2332] mb-6">
            We&apos;d Love to <span className="text-[#FF6B35]">Hear From You</span>
          </h1>
          <p className="text-xl text-[#44403C] max-w-2xl mx-auto">
            Have questions about ChapChap? Want to learn more about our features? 
            Our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl border shadow-sm">
              <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-6">
                Send us a Message
              </h2>
              
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A2332] mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-[#44403C]">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..." 
                      rows={5}
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-[#1A2332] mb-6">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.title} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-[#FF6B35]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1A2332]">{info.title}</p>
                        {info.href ? (
                          <a 
                            href={info.href} 
                            className="text-[#44403C] hover:text-[#FF6B35] transition-colors"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-[#44403C]">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-display font-semibold text-[#1A2332] mb-3">
                  Business Hours
                </h3>
                <div className="space-y-2 text-sm text-[#44403C]">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM (EAT)</p>
                  <p>Saturday: 10:00 AM - 2:00 PM (EAT)</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="bg-[#1A2332] p-6 rounded-2xl text-white">
                <h3 className="font-display font-semibold mb-3">
                  Enterprise Inquiries
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Looking for a custom solution for your large team? Our enterprise 
                  team is ready to help.
                </p>
                <a 
                  href="/enterprise" 
                  className="text-[#FF6B35] hover:text-[#FDB750] font-medium text-sm"
                >
                  Learn about Enterprise →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
