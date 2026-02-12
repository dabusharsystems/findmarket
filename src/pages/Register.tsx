import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Loader2, Package, Wrench, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

type UserRole = 'buyer' | 'seller';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'buyer';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, name, role);

    if (error) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Welcome to ReverseMarket!',
      description: 'Your account has been created successfully.',
    });

    navigate(role === 'buyer' ? '/dashboard/buyer' : '/dashboard/seller');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">R</span>
              </div>
              <span className="font-display text-2xl font-bold text-foreground">
                ReverseMarket
              </span>
            </Link>
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-2">
              Join Kenya's leading reverse marketplace
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                role === 'buyer'
                  ? 'border-product bg-product-light'
                  : 'border-border hover:border-product/50'
              }`}
            >
              <div className={`p-3 rounded-lg ${role === 'buyer' ? 'bg-product/20' : 'bg-muted'}`}>
                <Package className={`h-6 w-6 ${role === 'buyer' ? 'text-product' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className={`font-semibold ${role === 'buyer' ? 'text-product' : ''}`}>I'm a Buyer</div>
                <div className="text-xs text-muted-foreground">Post requests</div>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                role === 'seller'
                  ? 'border-service bg-service-light'
                  : 'border-border hover:border-service/50'
              }`}
            >
              <div className={`p-3 rounded-lg ${role === 'seller' ? 'bg-service/20' : 'bg-muted'}`}>
                <Wrench className={`h-6 w-6 ${role === 'seller' ? 'text-service' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <div className={`font-semibold ${role === 'seller' ? 'text-service' : ''}`}>I'm a Seller</div>
                <div className="text-xs text-muted-foreground">Offer products/services</div>
              </div>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full" 
              variant={role === 'buyer' ? 'product' : 'service'}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create {role === 'buyer' ? 'Buyer' : 'Seller'} Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-foreground">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-hero-gradient bg-hero-pattern items-center justify-center p-12">
        <div className="max-w-md text-center text-white space-y-6">
          <h2 className="text-3xl font-bold">
            {role === 'buyer' ? 'Find What You Need' : 'Grow Your Business'}
          </h2>
          <p className="text-white/80 text-lg">
            {role === 'buyer' 
              ? 'Post your requirements and receive competitive offers from verified sellers and service providers.'
              : 'Access ready-to-buy customers and expand your customer base with our subscription plans.'}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-accent">Free</div>
              <div className="text-sm text-white/70">To Get Started</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-accent">24/7</div>
              <div className="text-sm text-white/70">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
