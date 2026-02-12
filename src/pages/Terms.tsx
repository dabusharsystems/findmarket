import { FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-hero-gradient py-16">
        <div className="container-custom text-center">
          <div className="inline-flex p-3 rounded-xl bg-white/10 mb-4">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-white/80">Last updated: January 2026</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Findmarket ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Findmarket is a reverse marketplace platform that connects buyers seeking products or services with sellers who can fulfill those needs. The platform allows:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Buyers to post listings describing products or services they need</li>
              <li>Sellers to browse listings and submit bids</li>
              <li>Users to connect and complete transactions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To use certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. User Conduct</h2>
            <p className="text-muted-foreground mb-4">
              Users agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Post false, misleading, or fraudulent listings or bids</li>
              <li>Engage in any illegal activities through the Platform</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Circumvent the Platform's fee structure</li>
              <li>Use the Platform to spam or send unsolicited messages</li>
              <li>Attempt to access other users' accounts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Payments and Fees</h2>
            <p className="text-muted-foreground mb-4">
              Sellers are charged fees for submitting bids. Fee structures include:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Pay-per-bid: KES 10 per bid submission</li>
              <li>Subscription plans: Monthly fees for bulk or unlimited bidding</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All fees are non-refundable unless otherwise stated. We reserve the right to change our fee structure with notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Transactions</h2>
            <p className="text-muted-foreground">
              Findmarket facilitates connections between buyers and sellers but is not a party to any transaction. Users are solely responsible for ensuring the quality, safety, and legality of listed items and services. Disputes should be resolved directly between parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, logos, and materials on the Platform are owned by Findmarket or its licensors. Users retain ownership of content they post but grant us a license to display and distribute it on the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Findmarket is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Platform, including but not limited to direct, indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate accounts that violate these terms. Users may close their accounts at any time by contacting support.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at legal@findmarket.ke
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
