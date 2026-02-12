
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('buyer', 'seller', 'admin');

-- Create enum for listing types
CREATE TYPE public.listing_type AS ENUM ('product', 'service');

-- Create enum for listing status
CREATE TYPE public.listing_status AS ENUM ('open', 'resolved');

-- Create enum for condition
CREATE TYPE public.condition_type AS ENUM ('new', 'used', 'any');

-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed');

-- Create enum for payment method
CREATE TYPE public.payment_method AS ENUM ('single_bid', 'subscription');

-- Create enum for payment type
CREATE TYPE public.payment_type AS ENUM ('single_bid', 'subscription', 'subscription_renewal');

-- Create enum for transaction status
CREATE TYPE public.transaction_status AS ENUM ('pending', 'successful', 'failed', 'refunded');

-- Create enum for subscription status
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled');

-- Create enum for notification type
CREATE TYPE public.notification_type AS ENUM ('new_bid', 'bid_accepted', 'subscription_expiring', 'listing_resolved', 'connection_made');

-- Create enum for category type
CREATE TYPE public.category_type AS ENUM ('product', 'service');

-- Profiles table (references auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type category_type NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_type listing_type NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  status listing_status DEFAULT 'open',
  condition condition_type,
  required_date DATE,
  budget_min DECIMAL,
  budget_max DECIMAL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name TEXT NOT NULL,
  bid_limit INTEGER,
  bids_used INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status subscription_status DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL NOT NULL,
  estimated_time TEXT,
  message TEXT NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table (for revealing contact info)
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(listing_id, seller_id)
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bid_id UUID REFERENCES public.bids(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  payment_type payment_type NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'KES',
  transaction_ref TEXT UNIQUE,
  flutterwave_tx_ref TEXT,
  status transaction_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans reference table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  bid_limit INTEGER,
  features JSONB,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies

-- Profiles: Users can read all profiles, update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: Users can view own roles, admins can view all
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role during signup" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories: Everyone can read
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Subscription plans: Everyone can read
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans FOR SELECT USING (true);

-- Listings: Buyers see own, sellers see open listings
CREATE POLICY "Buyers can manage own listings" ON public.listings FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Sellers can view open listings" ON public.listings FOR SELECT USING (status = 'open');
CREATE POLICY "Admins can view all listings" ON public.listings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Subscriptions: Sellers manage own
CREATE POLICY "Sellers can manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = seller_id);

-- Bids: Complex policies
CREATE POLICY "Sellers can insert own bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can view own bids" ON public.bids FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can view paid bids on their listings" ON public.bids FOR SELECT 
  USING (payment_status = 'paid' AND listing_id IN (SELECT id FROM public.listings WHERE buyer_id = auth.uid()));

-- Connections
CREATE POLICY "Buyers can create connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can view own connections" ON public.connections FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Payments: Users see own
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications: Users see own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed categories
INSERT INTO public.categories (name, type, icon) VALUES
  ('Electronics', 'product', 'Smartphone'),
  ('Furniture', 'product', 'Sofa'),
  ('Vehicles', 'product', 'Car'),
  ('Clothing', 'product', 'Shirt'),
  ('Books', 'product', 'BookOpen'),
  ('Sports Equipment', 'product', 'Dumbbell'),
  ('Plumbing', 'service', 'Wrench'),
  ('Web Design', 'service', 'Globe'),
  ('Tutoring', 'service', 'GraduationCap'),
  ('Cleaning', 'service', 'Sparkles'),
  ('Photography', 'service', 'Camera'),
  ('Consulting', 'service', 'Briefcase');

-- Seed subscription plans
INSERT INTO public.subscription_plans (name, price, bid_limit, features, is_popular) VALUES
  ('Starter', 200, 30, '["30 bids per month", "Basic support", "Save KES 100 vs pay-per-bid"]', false),
  ('Professional', 500, 100, '["100 bids per month", "Priority listing visibility", "Email support", "Save KES 500 vs pay-per-bid"]', true),
  ('Business', 1500, NULL, '["Unlimited bids", "Featured provider badge", "Top placement in search", "Priority support", "Analytics dashboard"]', false);
