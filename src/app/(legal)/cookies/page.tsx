import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | ChapChap",
  description: "Learn about how ChapChap uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-display font-bold text-[#1A2332] mb-8">
        Cookie Policy
      </h1>
      
      <p className="text-[#44403C] mb-6">
        <strong>Last updated:</strong> December 2024
      </p>

      <div className="prose prose-lg max-w-none text-[#44403C]">
        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          1. What Are Cookies
        </h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when 
          you visit a website. They are widely used to make websites work more efficiently and 
          provide information to the owners of the site.
        </p>

        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          2. How We Use Cookies
        </h2>
        <p>ChapChap uses cookies for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>
            <strong>Essential Cookies:</strong> These cookies are necessary for the website to 
            function properly. They enable core functionality such as security, network management, 
            and account access.
          </li>
          <li>
            <strong>Authentication Cookies:</strong> We use these cookies to identify you when 
            you log in to our platform and keep you logged in during your session.
          </li>
          <li>
            <strong>Preference Cookies:</strong> These cookies remember your settings and 
            preferences, such as language and display preferences.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> We use analytics cookies to understand how 
            visitors interact with our website, helping us improve our services.
          </li>
        </ul>

        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          3. Types of Cookies We Use
        </h2>
        
        <h3 className="text-xl font-semibold text-[#1A2332] mt-6 mb-3">
          Session Cookies
        </h3>
        <p>
          These are temporary cookies that expire when you close your browser. They are used 
          to maintain your session while you navigate our website.
        </p>

        <h3 className="text-xl font-semibold text-[#1A2332] mt-6 mb-3">
          Persistent Cookies
        </h3>
        <p>
          These cookies remain on your device for a set period or until you delete them. They 
          help us recognize you as a returning visitor and remember your preferences.
        </p>

        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          4. Third-Party Cookies
        </h2>
        <p>
          We may use third-party services that set their own cookies, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Supabase:</strong> For authentication and database services</li>
          <li><strong>Paystack:</strong> For payment processing</li>
          <li><strong>Analytics providers:</strong> To help us understand website usage</li>
        </ul>

        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          5. Managing Cookies
        </h2>
        <p>
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>View what cookies are stored on your device</li>
          <li>Delete all or specific cookies</li>
          <li>Block cookies from being set</li>
          <li>Set preferences for certain websites</li>
        </ul>
        <p className="mt-4">
          Please note that blocking or deleting cookies may impact your experience on our 
          website and limit certain functionality.
        </p>

        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          6. Updates to This Policy
        </h2>
        <p>
          We may update this Cookie Policy from time to time. Any changes will be posted on 
          this page with an updated revision date.
        </p>

        <h2 className="text-2xl font-display font-semibold text-[#1A2332] mt-8 mb-4">
          7. Contact Us
        </h2>
        <p>
          If you have any questions about our use of cookies, please contact us at:
        </p>
        <ul className="list-none mt-4 space-y-1">
          <li><strong>Email:</strong> privacy@chapchap.io</li>
          <li><strong>Address:</strong> Nairobi, Kenya</li>
        </ul>
      </div>
    </div>
  );
}
