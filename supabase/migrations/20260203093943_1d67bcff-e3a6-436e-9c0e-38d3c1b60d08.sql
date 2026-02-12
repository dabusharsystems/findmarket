-- Add trust level columns to profiles for seller reputation system
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS trust_level TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS average_rating NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_connections INTEGER DEFAULT 0;

-- Create seller_ratings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seller_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  connection_id UUID NOT NULL REFERENCES public.connections(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(connection_id)
);

-- Enable RLS on seller_ratings
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seller_ratings
CREATE POLICY "Buyers can create ratings for their connections"
  ON public.seller_ratings FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Anyone can view ratings"
  ON public.seller_ratings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage ratings"
  ON public.seller_ratings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to update seller trust level based on ratings
CREATE OR REPLACE FUNCTION public.update_seller_trust_level()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  connection_count INTEGER;
  new_trust_level TEXT;
BEGIN
  -- Calculate average rating for seller
  SELECT AVG(rating), COUNT(*) INTO avg_rating, connection_count
  FROM public.seller_ratings
  WHERE seller_id = NEW.seller_id;

  -- Determine trust level based on rating and connection count
  IF connection_count >= 10 AND avg_rating >= 4.5 THEN
    new_trust_level := 'verified';
  ELSIF connection_count >= 5 AND avg_rating >= 4.0 THEN
    new_trust_level := 'trusted';
  ELSIF avg_rating < 2.5 THEN
    new_trust_level := 'low';
  ELSE
    new_trust_level := 'standard';
  END IF;

  -- Update seller profile
  UPDATE public.profiles
  SET 
    average_rating = COALESCE(avg_rating, 0),
    total_connections = connection_count,
    trust_level = new_trust_level
  WHERE id = NEW.seller_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update trust level on new rating
DROP TRIGGER IF EXISTS update_trust_on_rating ON public.seller_ratings;
CREATE TRIGGER update_trust_on_rating
  AFTER INSERT ON public.seller_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_seller_trust_level();