export const metadata = {
  title: "Refund Policy - ChapChap",
  description: "ChapChap Refund Policy",
};

export default function RefundsPage() {
  return (
    <div className="prose prose-gray max-w-none">
      <h1>Refund Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

      <h2>1. Free Trial</h2>
      <p>
        All new accounts start with a 14-day free trial of the Starter plan. No credit card 
        is required during the trial period. You can cancel at any time during the trial 
        without being charged.
      </p>

      <h2>2. Subscription Cancellation</h2>
      <p>
        You may cancel your subscription at any time through your account settings or by 
        contacting our support team. Upon cancellation:
      </p>
      <ul>
        <li>Your subscription will remain active until the end of your current billing period</li>
        <li>You will continue to have access to all features until the period ends</li>
        <li>You will not be charged for any subsequent billing periods</li>
        <li>Your data will be retained for 30 days after cancellation, after which it may be deleted</li>
      </ul>

      <h2>3. Refund Eligibility</h2>
      <p>
        We generally do not provide refunds for subscription payments. However, we may 
        consider refunds in the following circumstances:
      </p>
      <ul>
        <li><strong>Technical Issues:</strong> If you experienced significant technical problems that prevented you from using the Service and we were unable to resolve them</li>
        <li><strong>Billing Errors:</strong> If you were charged incorrectly due to a system error</li>
        <li><strong>Duplicate Charges:</strong> If you were charged multiple times for the same subscription period</li>
      </ul>

      <h2>4. Requesting a Refund</h2>
      <p>
        To request a refund, please contact our support team at support@chapchap.app with:
      </p>
      <ul>
        <li>Your account email address</li>
        <li>The date and amount of the charge</li>
        <li>The reason for your refund request</li>
        <li>Any relevant documentation or screenshots</li>
      </ul>
      <p>
        We will review your request and respond within 5 business days.
      </p>

      <h2>5. Refund Processing</h2>
      <p>
        If your refund is approved:
      </p>
      <ul>
        <li>Refunds will be processed to the original payment method</li>
        <li>Processing time is typically 5-10 business days, depending on your bank</li>
        <li>You will receive an email confirmation when the refund is processed</li>
      </ul>

      <h2>6. Plan Downgrades</h2>
      <p>
        If you downgrade from a higher-tier plan to a lower-tier plan:
      </p>
      <ul>
        <li>The change will take effect at the start of your next billing period</li>
        <li>You will retain access to higher-tier features until the end of your current period</li>
        <li>No prorated refunds are provided for unused time on the higher-tier plan</li>
      </ul>

      <h2>7. Plan Upgrades</h2>
      <p>
        When you upgrade to a higher-tier plan:
      </p>
      <ul>
        <li>You will be charged the difference immediately (prorated for the remaining days)</li>
        <li>New features will be available immediately</li>
        <li>Your billing cycle will remain the same</li>
      </ul>

      <h2>8. Enterprise Plans</h2>
      <p>
        Enterprise plan refunds are handled on a case-by-case basis according to the terms 
        of your enterprise agreement. Please contact your account manager for assistance.
      </p>

      <h2>9. Exceptions</h2>
      <p>
        We reserve the right to refuse refunds in cases of:
      </p>
      <ul>
        <li>Violation of our Terms of Service</li>
        <li>Fraudulent activity</li>
        <li>Abuse of the refund policy</li>
      </ul>

      <h2>10. Contact Us</h2>
      <p>
        If you have any questions about our refund policy, please contact us at:
      </p>
      <p>
        <strong>Email:</strong> support@chapchap.app
      </p>
    </div>
  );
}
