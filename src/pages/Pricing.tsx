import { Link } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  AlertTriangle, 
  Lock,
  ClipboardList,
  Calculator,
  CreditCard,
  Mouse,
  Smartphone,
  Home,
  BadgeCheck,
  Coins,
  Users,
  Eye,
  HelpCircle,
  Car,
  Laptop,
  Wrench,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricingTiers = [
  { 
    budgetRange: '0 – 2,000', 
    fee: '20', 
    maxPercent: '1.0%',
    typicalCategory: 'Errands, small accessories, basic repairs',
    highlight: false 
  },
  { 
    budgetRange: '2,001 – 15,000', 
    fee: '100', 
    maxPercent: '0.6%',
    typicalCategory: 'Electronics, furniture, professional services',
    highlight: false 
  },
  { 
    budgetRange: '15,001 – 100,000', 
    fee: '400', 
    maxPercent: '0.4%',
    typicalCategory: 'Laptops, tools, consultants',
    highlight: true 
  },
  { 
    budgetRange: '100,001 – 500,000', 
    fee: '1,500', 
    maxPercent: '0.3%',
    typicalCategory: 'Used bikes, high-end tech, bulk supplies',
    highlight: false 
  },
  { 
    budgetRange: '500,001 – 1,000,000', 
    fee: '3,000', 
    maxPercent: '0.3%',
    typicalCategory: 'Cars, machinery, commercial equipment',
    highlight: false 
  },
  { 
    budgetRange: '1,000,001+', 
    fee: '5,000', 
    maxPercent: '≤0.5%',
    typicalCategory: 'Real estate, vehicles, industrial',
    highlight: false, 
    capped: true 
  },
];

const realWorldExamples = [
  {
    icon: Mouse,
    title: 'Computer Mouse',
    budget: 'KES 1,500',
    fee: '20 KES',
    tier: 'Basic',
  },
  {
    icon: Smartphone,
    title: 'Smartphone',
    budget: 'KES 25,000',
    fee: '400 KES',
    tier: 'Premium',
  },
  {
    icon: Laptop,
    title: 'Laptop',
    budget: 'KES 80,000',
    fee: '400 KES',
    tier: 'Premium',
  },
  {
    icon: Car,
    title: 'Used Car',
    budget: 'KES 800,000',
    fee: '3,000 KES',
    tier: 'Business',
  },
  {
    icon: Building2,
    title: 'Apartment Rental',
    budget: 'KES 5,000,000',
    fee: '5,000 KES',
    tier: 'Capped',
    capped: true,
  },
  {
    icon: Wrench,
    title: 'Plumbing Service',
    budget: 'KES 8,000',
    fee: '100 KES',
    tier: 'Standard',
  },
];

const trustLevels = [
  {
    icon: BadgeCheck,
    level: 'Verified Seller',
    description: '10+ ratings with 4.5+ average',
    discount: '-20%',
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  {
    icon: Star,
    level: 'Trusted Seller',
    description: '5+ ratings with 4.0+ average',
    discount: '-10%',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
  {
    icon: Users,
    level: 'Standard',
    description: 'New or building reputation',
    discount: '0%',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
  },
  {
    icon: AlertTriangle,
    level: 'Low Rated',
    description: 'Below 2.5 average rating',
    discount: '+15%',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30',
  },
];

const whyFair = [
  { icon: Coins, text: 'No subscriptions required' },
  { icon: BadgeCheck, text: 'No commissions on sales' },
  { icon: Eye, text: 'No hidden fees' },
  { icon: Users, text: 'Pay only for opportunities you choose' },
];

const faqs = [
  {
    question: 'Do buyers pay anything?',
    answer: 'No, listing is completely free for buyers. They simply post what they need and receive bids from verified sellers.',
  },
  {
    question: 'Why do sellers pay to bid?',
    answer: 'The small bid fee reduces spam and ensures only serious, quality offers reach buyers. This creates a better marketplace for everyone.',
  },
  {
    question: "What if a buyer doesn't respond?",
    answer: "Bid fees are intentionally kept low and capped to minimize your risk. Even for multi-million shilling listings, you'll never pay more than KES 5,000.",
  },
  {
    question: 'Can I see the fee before paying?',
    answer: 'Yes, absolutely. The exact fee is always calculated and displayed clearly before you confirm your bid. No surprises.',
  },
  {
    question: 'How do I get a trust discount?',
    answer: 'Complete connections and get positive ratings from buyers. After 5+ ratings with a 4.0+ average, you become a Trusted Seller with 10% discount. Verified Sellers (10+ ratings, 4.5+ average) get 20% off.',
  },
  {
    question: 'What happens to low-rated sellers?',
    answer: 'Sellers with 3+ ratings averaging below 2.5 pay 15% more on bid fees. This encourages quality service and protects buyers.',
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-hero-gradient py-20 md:py-28">
        <div className="container-custom text-center">
          <Badge className="mb-6 bg-accent/20 text-accent-foreground border-accent/30">
            Transparent & Fair Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 max-w-4xl mx-auto leading-tight">
            Fair Pricing That Scales With Opportunity
          </h1>
          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Sellers only pay to bid — and never more than the value of the lead.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="xl" 
              variant="accent"
              onClick={() => document.getElementById('pricing-table')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20"
              asChild
            >
              <Link to="/register?role=seller">
                Start Selling
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How Pricing Works - 3 Steps */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Pricing Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Simple, transparent, and designed to be fair for both buyers and sellers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-product-light flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="h-8 w-8 text-product" />
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Step 1</div>
              <h3 className="text-xl font-semibold mb-3">Buyer posts for free</h3>
              <p className="text-muted-foreground text-sm">
                Buyers list what they want and include a budget range. No cost to post.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Calculator className="h-8 w-8 text-accent" />
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Step 2</div>
              <h3 className="text-xl font-semibold mb-3">Bid fee is calculated</h3>
              <p className="text-muted-foreground text-sm">
                Fee is based on the buyer's budget — not a flat rate. Your trust level affects the final price.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-elevated transition-shadow">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-success" />
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Step 3</div>
              <h3 className="text-xl font-semibold mb-3">Only pay when you bid</h3>
              <p className="text-muted-foreground text-sm">
                No subscriptions required to start. Pay only for opportunities you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiered Pricing Table */}
      <section id="pricing-table" className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              Budget-Based Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tiered Bid Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your bid fee is determined by the buyer's listed budget. Simple and transparent.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-base font-semibold py-4">Buyer's Budget (KES)</TableHead>
                      <TableHead className="text-base font-semibold py-4 text-right">Bid Fee (KES)</TableHead>
                      <TableHead className="text-base font-semibold py-4 text-right hidden sm:table-cell">Max % of Budget</TableHead>
                      <TableHead className="text-base font-semibold py-4 hidden md:table-cell">Typical Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingTiers.map((tier, index) => (
                      <TableRow 
                        key={index} 
                        className={tier.highlight ? 'bg-accent/5' : ''}
                      >
                        <TableCell className="font-medium py-4">
                          {tier.budgetRange}
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <span className="font-semibold text-foreground">
                            {tier.fee}
                          </span>
                          {tier.capped && (
                            <Badge variant="outline" className="ml-2 bg-accent/10 text-accent border-accent/30">
                              Capped
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right py-4 text-muted-foreground hidden sm:table-cell">
                          {tier.maxPercent}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                          {tier.typicalCategory}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <p className="text-center text-muted-foreground mt-6 text-sm bg-muted/50 p-4 rounded-xl border border-border">
              <Lock className="h-4 w-4 inline-block mr-2 text-accent" />
              Even for multi-million shilling listings, bid fees are <strong>capped at KES 5,000</strong> to keep leads affordable.
            </p>
          </div>
        </div>
      </section>

      {/* Trust-Based Pricing */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-success/10 text-success border-success/30">
              Reputation Matters
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trust Rewards & Penalties</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your reputation directly affects what you pay. Build trust, save money.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {trustLevels.map((trust, index) => {
                const Icon = trust.icon;
                return (
                  <div 
                    key={index}
                    className={`flex items-start gap-4 p-5 rounded-xl bg-card border ${trust.borderColor}`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${trust.bgColor} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-6 w-6 ${trust.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{trust.level}</span>
                        <Badge className={`${trust.bgColor} ${trust.color} ${trust.borderColor} shrink-0`}>
                          {trust.discount}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mt-1">
                        {trust.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-accent/20 p-6 text-center">
              <Lock className="h-6 w-6 text-accent mx-auto mb-3" />
              <p className="font-medium text-foreground">
                Ratings are earned only after completed connections — no gaming the system
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Your reputation directly affects what you pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real World Examples */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real-World Examples</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See exactly what you'd pay to bid on different types of listings.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {realWorldExamples.map((example, index) => {
              const Icon = example.icon;
              return (
                <div 
                  key={index}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-elevated transition-all hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Icon className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{example.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">Budget: {example.budget}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">Bid Fee:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-accent">{example.fee}</span>
                      {example.capped && (
                        <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">
                          Max Cap
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why This Is Fair */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why This Is Fair</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We built our pricing to be seller-friendly and completely transparent.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {whyFair.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-success" />
                  </div>
                  <span className="font-medium text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center mt-10">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-accent/10 border border-accent/20">
              <Check className="h-5 w-5 text-accent" />
              <span className="font-medium text-foreground">
                100% of your bid fee goes toward accessing quality leads
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-elevated"
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 bg-hero-gradient">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Start Selling Smarter
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-10">
            Join thousands of sellers connecting with buyers who are actively looking for what you offer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="xl" 
              variant="accent"
              asChild
            >
              <Link to="/browse">
                Browse Listings
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="bg-white/10 text-primary-foreground border-white/30 hover:bg-white/20"
              asChild
            >
              <Link to="/register?role=seller">
                Create Seller Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
