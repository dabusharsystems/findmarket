import { Link } from 'react-router-dom';
import { 
  Package, 
  Wrench, 
  ArrowRight, 
  Search, 
  MessageSquare, 
  Handshake, 
  Shield,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.png';

const HeroSection = () => (
  <section className="relative overflow-hidden bg-[hsl(210_25%_96%)]">
    <div className="container-custom relative py-12 lg:py-16">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left content */}
        <div className="space-y-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight">
            Post what you need.{' '}
            <span className="block">Get competitive offers</span>
            <span className="block">from sellers.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl">
            FindMarket connects buyers with sellers who have exactly what they're for.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button size="lg" variant="accent" className="text-base px-8" asChild>
              <Link to="/register">
                Get Started
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
              <Link to="#how-it-works">
                How It Works
              </Link>
            </Button>
          </div>
        </div>

        {/* Right content - Hero image */}
        <div className="hidden lg:block">
          <img 
            src={heroBanner} 
            alt="FindMarket - Connect buyers and sellers" 
            className="w-full h-auto max-h-[500px] object-contain"
          />
        </div>
      </div>
    </div>
  </section>
);

const CategoryCard = ({ 
  type, 
  title, 
  description, 
  icon: Icon 
}: { 
  type: 'product' | 'service';
  title: string;
  description: string;
  icon: React.ElementType;
}) => (
  <Link
    to={`/browse?type=${type}`}
    className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:shadow-floating ${
      type === 'product' 
        ? 'bg-product-light hover:bg-product/10 border-2 border-product/20 hover:border-product' 
        : 'bg-service-light hover:bg-service/10 border-2 border-service/20 hover:border-service'
    }`}
  >
    <div className={`inline-flex p-4 rounded-xl ${type === 'product' ? 'bg-product/10' : 'bg-service/10'} mb-6`}>
      <Icon className={`h-8 w-8 ${type === 'product' ? 'text-product' : 'text-service'}`} />
    </div>
    <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
    <p className="text-muted-foreground mb-6">{description}</p>
    <div className={`inline-flex items-center gap-2 font-semibold ${type === 'product' ? 'text-product' : 'text-service'}`}>
      Browse {title}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </div>
  </Link>
);

const CategorySection = () => (
  <section className="py-20 bg-background">
    <div className="container-custom">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Are You Looking For?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Whether you need a product or a service, post your request and let sellers come to you.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <CategoryCard
          type="product"
          title="Products"
          description="Looking for electronics, furniture, vehicles, clothing, or anything else? Post what you need and get competitive offers."
          icon={Package}
        />
        <CategoryCard
          type="service"
          title="Services"
          description="Need a plumber, designer, tutor, or any other professional? Describe your requirements and receive bids from qualified providers."
          icon={Wrench}
        />
      </div>
    </div>
  </section>
);

const HowItWorksStep = ({ 
  step, 
  title, 
  description, 
  icon: Icon 
}: { 
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
}) => (
  <div className="relative flex flex-col items-center text-center">
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
        <Icon className="h-10 w-10 text-primary-foreground" />
      </div>
      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
        {step}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-20 bg-muted/50">
    <div className="container-custom">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get what you need in just a few simple steps.
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
        <HowItWorksStep
          step={1}
          title="Post Your Request"
          description="Describe what you're looking for - product or service, with your budget and requirements."
          icon={Search}
        />
        <HowItWorksStep
          step={2}
          title="Receive Bids"
          description="Verified sellers and service providers submit competitive offers for your request."
          icon={MessageSquare}
        />
        <HowItWorksStep
          step={3}
          title="Compare & Choose"
          description="Review bids, check provider profiles, and select the best offer for your needs."
          icon={Star}
        />
        <HowItWorksStep
          step={4}
          title="Connect & Deal"
          description="Connect with your chosen seller and complete your transaction securely."
          icon={Handshake}
        />
      </div>
    </div>
  </section>
);

const BenefitCard = ({ 
  title, 
  description, 
  icon: Icon,
  forBuyer = true
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  forBuyer?: boolean;
}) => (
  <div className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:shadow-soft transition-shadow">
    <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${forBuyer ? 'bg-product/10' : 'bg-service/10'}`}>
      <Icon className={`h-6 w-6 ${forBuyer ? 'text-product' : 'text-service'}`} />
    </div>
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const BenefitsSection = () => (
  <section className="py-20 bg-background">
    <div className="container-custom">
      <div className="grid lg:grid-cols-2 gap-16">
        {/* Buyers */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-product/10 text-product text-sm font-medium mb-6">
            <Package className="h-4 w-4" />
            For Buyers
          </div>
          <h2 className="text-3xl font-bold mb-8">Why Buy Here?</h2>
          <div className="space-y-4">
            <BenefitCard
              icon={Shield}
              title="Privacy Protected"
              description="Your contact info stays hidden until you choose to connect with a seller."
              forBuyer={true}
            />
            <BenefitCard
              icon={TrendingUp}
              title="Competitive Offers"
              description="Sellers compete for your business, ensuring you get the best prices."
              forBuyer={true}
            />
            <BenefitCard
              icon={Star}
              title="Quality Verified"
              description="All sellers go through verification to ensure quality service."
              forBuyer={true}
            />
          </div>
        </div>

        {/* Sellers */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-service/10 text-service text-sm font-medium mb-6">
            <Wrench className="h-4 w-4" />
            For Sellers
          </div>
          <h2 className="text-3xl font-bold mb-8">Why Sell Here?</h2>
          <div className="space-y-4">
            <BenefitCard
              icon={Users}
              title="Ready Customers"
              description="Reach buyers who are actively looking for what you offer."
              forBuyer={false}
            />
            <BenefitCard
              icon={MessageSquare}
              title="Direct Communication"
              description="Connect directly with interested buyers when they accept your bid."
              forBuyer={false}
            />
            <BenefitCard
              icon={TrendingUp}
              title="Grow Your Business"
              description="Build your reputation and expand your customer base effortlessly."
              forBuyer={false}
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="py-20 bg-hero-gradient">
    <div className="container-custom">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-white/80">
          Join thousands of Kenyans who are already using Findmarket to find exactly what they need.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" variant="hero" asChild>
            <Link to="/register?role=buyer">
              I'm Looking to Buy
              <Package className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="xl" variant="hero-outline" asChild>
            <Link to="/register?role=seller">
              I'm a Seller/Provider
              <Wrench className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

const Index = () => {
  return (
    <div>
      <HeroSection />
      <CategorySection />
      <FeaturedListings />
      <HowItWorksSection />
      <BenefitsSection />
      <CTASection />
    </div>
  );
};

export default Index;
