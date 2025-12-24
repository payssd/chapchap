import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | ChapChap",
  description: "Tips, insights, and best practices for managing invoices and getting paid faster.",
};

const blogPosts = [
  {
    id: 1,
    title: "5 Ways to Reduce Payment Delays in Your Business",
    excerpt: "Learn proven strategies to get your clients to pay on time and improve your cash flow.",
    category: "Tips & Tricks",
    date: "Dec 20, 2024",
    readTime: "5 min read",
    image: "/blog/payment-delays.jpg",
  },
  {
    id: 2,
    title: "The Psychology of Payment Reminders",
    excerpt: "Understanding why gentle, well-timed reminders work better than aggressive follow-ups.",
    category: "Insights",
    date: "Dec 15, 2024",
    readTime: "7 min read",
    image: "/blog/psychology.jpg",
  },
  {
    id: 3,
    title: "How to Write Professional Invoice Emails",
    excerpt: "Templates and tips for crafting invoice emails that get results.",
    category: "Templates",
    date: "Dec 10, 2024",
    readTime: "4 min read",
    image: "/blog/emails.jpg",
  },
  {
    id: 4,
    title: "M-Pesa Integration: A Complete Guide",
    excerpt: "Everything you need to know about accepting M-Pesa payments through ChapChap.",
    category: "Guides",
    date: "Dec 5, 2024",
    readTime: "8 min read",
    image: "/blog/mpesa.jpg",
  },
  {
    id: 5,
    title: "Cash Flow Management for Small Businesses",
    excerpt: "Essential tips for maintaining healthy cash flow in your growing business.",
    category: "Finance",
    date: "Nov 28, 2024",
    readTime: "6 min read",
    image: "/blog/cashflow.jpg",
  },
  {
    id: 6,
    title: "Automating Your Invoicing Workflow",
    excerpt: "How to save hours every week by automating your invoicing and payment collection.",
    category: "Automation",
    date: "Nov 20, 2024",
    readTime: "5 min read",
    image: "/blog/automation.jpg",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FF6B35]/10 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#1A2332] mb-6">
            ChapChap <span className="text-[#FF6B35]">Blog</span>
          </h1>
          <p className="text-xl text-[#44403C] max-w-2xl mx-auto">
            Tips, insights, and best practices for managing invoices, 
            improving cash flow, and growing your business.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="h-48 bg-gradient-to-br from-[#FF6B35]/20 to-[#FDB750]/20 flex items-center justify-center">
                  <span className="text-6xl opacity-50">📝</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-display font-semibold text-[#1A2332] mb-2 group-hover:text-[#FF6B35] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#44403C] mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <p className="text-[#44403C] mb-4">More articles coming soon!</p>
            <Link 
              href="/signup" 
              className="inline-flex items-center gap-2 text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium"
            >
              Subscribe to our newsletter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
