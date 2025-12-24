import Link from "next/link";
import { Zap, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const footerLinks = {
    Product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "FAQ", href: "#faq" },
    ],
    Company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
    Support: [
      { label: "Help Center", href: "/help" },
      { label: "API Documentation", href: "/docs" },
      { label: "Status", href: "/status" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/chapchap", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/chapchap", label: "LinkedIn" },
    { icon: Facebook, href: "https://facebook.com/chapchap", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/chapchap", label: "Instagram" },
  ];

  return (
    <footer className="bg-[#1A2332] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-1.5 bg-gradient-to-br from-[#FF6B35] to-[#FDB750] rounded-lg shadow-md group-hover:shadow-orange transition-shadow">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">ChapChap</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Automated payment reminders for East African businesses. Get paid chapchap,
              stress less.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#FF6B35] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-[#FF6B35] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ChapChap. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Made with <span className="text-[#FF6B35]">❤️</span> in East Africa 🌍</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
