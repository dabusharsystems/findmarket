-- Create enums for new fields
CREATE TYPE public.delivery_preference AS ENUM ('delivery', 'pickup', 'both');
CREATE TYPE public.contact_method AS ENUM ('email', 'phone', 'both');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.negotiation_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');

-- Create negotiations table for counter-offers
CREATE TABLE public.negotiations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  message TEXT NOT NULL,
  status public.negotiation_status NOT NULL DEFAULT 'pending',
  round_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT max_rounds CHECK (round_number <= 5)
);

-- Enable RLS on negotiations
ALTER TABLE public.negotiations ENABLE ROW LEVEL SECURITY;

-- Add new columns to listings table
ALTER TABLE public.listings 
  ADD COLUMN delivery_preference public.delivery_preference DEFAULT 'both',
  ADD COLUMN contact_method public.contact_method DEFAULT 'both',
  ADD COLUMN urgency public.urgency_level,
  ADD COLUMN visibility_days INTEGER DEFAULT 30,
  ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN is_negotiable BOOLEAN DEFAULT true,
  ADD COLUMN is_flagged BOOLEAN DEFAULT false,
  ADD COLUMN flagged_reason TEXT,
  ADD COLUMN flagged_at TIMESTAMP WITH TIME ZONE;

-- Add new columns to bids table
ALTER TABLE public.bids 
  ADD COLUMN seller_location TEXT,
  ADD COLUMN delivery_options TEXT,
  ADD COLUMN availability TEXT,
  ADD COLUMN offer_valid_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN negotiation_status public.negotiation_status DEFAULT 'pending',
  ADD COLUMN counter_offer_count INTEGER DEFAULT 0;

-- Add new columns to profiles table for admin moderation
ALTER TABLE public.profiles 
  ADD COLUMN is_suspended BOOLEAN DEFAULT false,
  ADD COLUMN suspended_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN suspended_reason TEXT,
  ADD COLUMN response_rate NUMERIC DEFAULT 0;

-- RLS Policies for negotiations
CREATE POLICY "Users can view negotiations they're part of"
  ON public.negotiations FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create negotiations"
  ON public.negotiations FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Recipients can update negotiation status"
  ON public.negotiations FOR UPDATE
  USING (auth.uid() = to_user_id);

CREATE POLICY "Admins can view all negotiations"
  ON public.negotiations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update negotiations"
  ON public.negotiations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to set listing expiration on creation
CREATE OR REPLACE FUNCTION public.set_listing_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NULL AND NEW.visibility_days IS NOT NULL THEN
    NEW.expires_at := NEW.created_at + (NEW.visibility_days || ' days')::INTERVAL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for setting expiration
CREATE TRIGGER set_listing_expiration_trigger
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_listing_expiration();

-- Function to check max counter-offers
CREATE OR REPLACE FUNCTION public.check_max_counter_offers()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.negotiations
  WHERE bid_id = NEW.bid_id;
  
  IF current_count >= 5 THEN
    RAISE EXCEPTION 'Maximum counter-offer limit (5) reached for this bid';
  END IF;
  
  NEW.round_number := current_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for counter-offer limit
CREATE TRIGGER check_counter_offer_limit
  BEFORE INSERT ON public.negotiations
  FOR EACH ROW
  EXECUTE FUNCTION public.check_max_counter_offers();

-- Function to handle accepted negotiation
CREATE OR REPLACE FUNCTION public.handle_accepted_negotiation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    -- Mark listing as resolved
    UPDATE public.listings 
    SET status = 'resolved', updated_at = now()
    WHERE id = NEW.listing_id;
    
    -- Update bid negotiation status
    UPDATE public.bids
    SET negotiation_status = 'accepted'
    WHERE id = NEW.bid_id;
    
    -- Create connection record
    INSERT INTO public.connections (listing_id, buyer_id, seller_id, bid_id)
    SELECT 
      NEW.listing_id,
      l.buyer_id,
      b.seller_id,
      NEW.bid_id
    FROM public.listings l
    JOIN public.bids b ON b.id = NEW.bid_id
    WHERE l.id = NEW.listing_id
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for handling accepted negotiations
CREATE TRIGGER handle_accepted_negotiation_trigger
  AFTER UPDATE ON public.negotiations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_accepted_negotiation();