import { Shield } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-hero-gradient py-16">
        <div className="container-custom text-center">
          <div className="inline-flex p-3 rounded-xl bg-white/10 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-white/80">Last updated: January 2026</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Findmarket ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Name and email address when you register</li>
              <li>Phone number (optional, for contact purposes)</li>
              <li>Profile information and avatar</li>
              <li>Payment information for sellers</li>
              <li>Content you post (listings, bids, messages)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2 mt-6">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Device and browser information</li>
              <li>IP address and location data</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and maintain the Platform</li>
              <li>Process transactions and send related notifications</li>
              <li>Connect buyers with sellers</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our services and user experience</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share information:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>With other users:</strong> When you connect with a seller, your contact information is shared with them</li>
              <li><strong>With service providers:</strong> Payment processors, hosting providers, analytics services</li>
              <li><strong>For legal reasons:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with mergers or acquisitions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Object to certain processing activities</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist in marketing efforts. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our Platform is not intended for children under 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">9. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide services. We may retain certain information for legal or legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">10. International Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than Kenya. We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground">
              For privacy-related inquiries, contact our Data Protection Officer at privacy@findmarket.ke
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
