export const metadata = {
  title: "Privacy Policy - ChapChap",
  description: "ChapChap Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Introduction</h2>
      <p>
        ChapChap ("we", "our", or "us") is committed to protecting your privacy. This Privacy 
        Policy explains how we collect, use, disclose, and safeguard your information when 
        you use our invoice management platform.
      </p>

      <h2>2. Information We Collect</h2>
      
      <h3>2.1 Information You Provide</h3>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, phone number, business name</li>
        <li><strong>Client Information:</strong> Names, email addresses, phone numbers of your clients</li>
        <li><strong>Invoice Data:</strong> Invoice amounts, descriptions, due dates, payment status</li>
        <li><strong>Payment Information:</strong> Processed securely through Paystack (we don't store card details)</li>
      </ul>

      <h3>2.2 Information Collected Automatically</h3>
      <ul>
        <li>Device information (browser type, operating system)</li>
        <li>IP address and location data</li>
        <li>Usage data (pages visited, features used, time spent)</li>
        <li>Cookies and similar tracking technologies</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use the collected information to:</p>
      <ul>
        <li>Provide and maintain the Service</li>
        <li>Process invoices and send reminders on your behalf</li>
        <li>Process subscription payments</li>
        <li>Send you service-related communications</li>
        <li>Improve and personalize the Service</li>
        <li>Analyze usage patterns and trends</li>
        <li>Detect and prevent fraud or abuse</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>4. Information Sharing</h2>
      <p>We may share your information with:</p>
      <ul>
        <li><strong>Service Providers:</strong> Third parties that help us operate the Service (e.g., Paystack for payments, Supabase for data storage)</li>
        <li><strong>Your Clients:</strong> When you send invoices or reminders, your business information is shared with your clients</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
      </ul>
      <p>We do not sell your personal information to third parties.</p>

      <h2>5. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your data, including:
      </p>
      <ul>
        <li>Encryption of data in transit and at rest</li>
        <li>Secure authentication mechanisms</li>
        <li>Regular security assessments</li>
        <li>Access controls and monitoring</li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain your data for as long as your account is active or as needed to provide 
        services. After account deletion, we may retain certain data for legal compliance 
        or legitimate business purposes for up to 7 years.
      </p>

      <h2>7. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Request a copy of your personal data</li>
        <li><strong>Correction:</strong> Request correction of inaccurate data</li>
        <li><strong>Deletion:</strong> Request deletion of your data</li>
        <li><strong>Export:</strong> Request your data in a portable format</li>
        <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
      </ul>
      <p>
        To exercise these rights, contact us at support@chapchap.app.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use cookies and similar technologies to:
      </p>
      <ul>
        <li>Keep you logged in</li>
        <li>Remember your preferences</li>
        <li>Analyze usage patterns</li>
        <li>Improve the Service</li>
      </ul>
      <p>
        You can control cookies through your browser settings, but disabling them may 
        affect Service functionality.
      </p>

      <h2>9. Third-Party Services</h2>
      <p>
        The Service integrates with third-party services that have their own privacy policies:
      </p>
      <ul>
        <li><strong>Paystack:</strong> Payment processing</li>
        <li><strong>Supabase:</strong> Data storage and authentication</li>
        <li><strong>Africa's Talking:</strong> SMS notifications</li>
      </ul>

      <h2>10. Children's Privacy</h2>
      <p>
        The Service is not intended for users under 18 years of age. We do not knowingly 
        collect information from children.
      </p>

      <h2>11. International Data Transfers</h2>
      <p>
        Your data may be transferred to and processed in countries other than your own. 
        We ensure appropriate safeguards are in place for such transfers.
      </p>

      <h2>12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of 
        significant changes via email or through the Service.
      </p>

      <h2>13. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy, please contact us at:
      </p>
      <p>
        <strong>Email:</strong> support@chapchap.app
      </p>
    </div>
  );
}
