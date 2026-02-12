-- =====================================================
-- SECURITY FIXES & FEATURE ADDITIONS
-- =====================================================

-- 1. Add images columns to listings and bids
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
ALTER TABLE public.bids ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 2. Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('listing-images', 'listing-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bid-images', 'bid-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing-images bucket
CREATE POLICY "Anyone can view listing images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own listing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for bid-images bucket
CREATE POLICY "Anyone can view bid images"
ON storage.objects FOR SELECT
USING (bucket_id = 'bid-images');

CREATE POLICY "Authenticated users can upload bid images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'bid-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own bid images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bid-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own bid images"
ON storage.objects FOR DELETE
USING (bucket_id = 'bid-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- 3. FIX PROFILES SECURITY - Restrict email visibility
-- =====================================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Create more restrictive policy: only view own profile or connected users
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.connections 
    WHERE (connections.buyer_id = auth.uid() AND connections.seller_id = profiles.id)
    OR (connections.seller_id = auth.uid() AND connections.buyer_id = profiles.id)
  )
);

-- =====================================================
-- 4. FIX NOTIFICATIONS - Allow system to insert
-- =====================================================
-- Add policy for inserting notifications (for backend/triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Also allow authenticated users to insert (for client-side notification creation)
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 5. FIX BIDS - Allow sellers to update their own bids
-- =====================================================
CREATE POLICY "Sellers can update own bids"
ON public.bids FOR UPDATE
USING (auth.uid() = seller_id);

-- =====================================================
-- 6. FIX PAYMENTS - Allow status updates
-- =====================================================
CREATE POLICY "Users can update own payments"
ON public.payments FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- 7. ADD ADMIN POLICIES
-- =====================================================
-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update subscriptions
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage user roles
CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can view all bids
CREATE POLICY "Admins can view all bids"
ON public.bids FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
ON public.payments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update payments (for refunds, etc.)
CREATE POLICY "Admins can update payments"
ON public.payments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can view all connections
CREATE POLICY "Admins can view all connections"
ON public.connections FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can view all notifications  
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- 8. CREATE FUNCTION TO INSERT NOTIFICATIONS SAFELY
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _type notification_type,
  _title text,
  _message text,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (_user_id, _type, _title, _message, _metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;