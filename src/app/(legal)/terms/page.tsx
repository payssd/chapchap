export const metadata = {
  title: "Terms of Service - ChapChap",
  description: "ChapChap Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using ChapChap ("the Service"), you agree to be bound by these Terms of Service. 
        If you do not agree to these terms, please do not use the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        ChapChap is an invoice management and payment reminder platform that helps businesses 
        manage their invoices, send automated reminders, and track payments.
      </p>

      <h2>3. Account Registration</h2>
      <p>
        To use the Service, you must create an account. You agree to:
      </p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Maintain the security of your account credentials</li>
        <li>Notify us immediately of any unauthorized access</li>
        <li>Be responsible for all activities under your account</li>
      </ul>

      <h2>4. Subscription Plans</h2>
      <p>
        ChapChap offers different subscription plans with varying features and limits:
      </p>
      <ul>
        <li><strong>Starter Plan:</strong> Up to 50 invoices per month with basic features</li>
        <li><strong>Professional Plan:</strong> Unlimited invoices with advanced features</li>
        <li><strong>Enterprise Plan:</strong> Custom solutions for large teams</li>
      </ul>
      <p>
        All plans include a 14-day free trial. After the trial period, you will be charged 
        according to your selected plan unless you cancel.
      </p>

      <h2>5. Payment Terms</h2>
      <p>
        Subscription fees are billed monthly in advance. All payments are processed securely 
        through Paystack. You agree to provide accurate billing information and authorize 
        us to charge your payment method.
      </p>

      <h2>6. Cancellation and Refunds</h2>
      <p>
        You may cancel your subscription at any time. Upon cancellation:
      </p>
      <ul>
        <li>Your subscription will remain active until the end of the current billing period</li>
        <li>You will not be charged for subsequent periods</li>
        <li>No refunds are provided for partial months</li>
      </ul>

      <h2>7. Acceptable Use</h2>
      <p>
        You agree not to use the Service to:
      </p>
      <ul>
        <li>Violate any laws or regulations</li>
        <li>Send spam or unsolicited communications</li>
        <li>Harass or harm others</li>
        <li>Attempt to gain unauthorized access to the Service</li>
        <li>Interfere with the proper functioning of the Service</li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are owned by 
        ChapChap and are protected by international copyright, trademark, and other 
        intellectual property laws.
      </p>

      <h2>9. Data and Privacy</h2>
      <p>
        Your use of the Service is also governed by our Privacy Policy. By using the Service, 
        you consent to the collection and use of your data as described in the Privacy Policy.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        ChapChap shall not be liable for any indirect, incidental, special, consequential, 
        or punitive damages resulting from your use of the Service. Our total liability 
        shall not exceed the amount paid by you in the twelve months preceding the claim.
      </p>

      <h2>11. Disclaimer of Warranties</h2>
      <p>
        The Service is provided "as is" without warranties of any kind, either express or 
        implied. We do not guarantee that the Service will be uninterrupted, secure, or 
        error-free.
      </p>

      <h2>12. Changes to Terms</h2>
      <p>
        We reserve the right to modify these terms at any time. We will notify you of 
        significant changes via email or through the Service. Continued use of the Service 
        after changes constitutes acceptance of the new terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with the laws of Kenya, 
        without regard to its conflict of law provisions.
      </p>

      <h2>14. Contact Us</h2>
      <p>
        If you have any questions about these Terms of Service, please contact us at:
      </p>
      <p>
        <strong>Email:</strong> support@chapchap.app
      </p>
    </div>
  );
}
