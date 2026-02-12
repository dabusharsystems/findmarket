-- ================================================================
-- SECURITY FIX MIGRATION: Address 3 error-level security issues
-- ================================================================

-- ============================================================
-- FIX 1: NOTIFICATION RPC - Prevent impersonation attacks
-- Replace SECURITY DEFINER with SECURITY INVOKER and add authorization
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid, 
  _type notification_type, 
  _title text, 
  _message text, 
  _metadata jsonb DEFAULT NULL::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER to INVOKER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
  caller_id uuid;
BEGIN
  caller_id := auth.uid();
  
  -- Authorization check: caller must have legitimate relationship with target
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Allow if caller is creating notification for themselves
  IF caller_id = _user_id THEN
    -- Self-notifications are allowed
    NULL;
  -- Allow if caller has connection with target user (buyer/seller relationship)
  ELSIF EXISTS (
    SELECT 1 FROM public.connections 
    WHERE (buyer_id = caller_id AND seller_id = _user_id)
       OR (seller_id = caller_id AND buyer_id = _user_id)
  ) THEN
    NULL;
  -- Allow if caller is seller bidding on target's (buyer's) listing
  ELSIF EXISTS (
    SELECT 1 FROM public.bids b
    JOIN public.listings l ON b.listing_id = l.id
    WHERE b.seller_id = caller_id AND l.buyer_id = _user_id
  ) THEN
    NULL;
  -- Allow if caller is buyer and target is seller on their listing
  ELSIF EXISTS (
    SELECT 1 FROM public.listings l
    JOIN public.bids b ON b.listing_id = l.id
    WHERE l.buyer_id = caller_id AND b.seller_id = _user_id
  ) THEN
    NULL;
  -- Allow admins to create any notification
  ELSIF public.has_role(caller_id, 'admin') THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Unauthorized: no relationship with target user';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, metadata)
  VALUES (_user_id, _type, _title, _message, _metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- ============================================================
-- FIX 2: CONNECTION BYPASS - Validate paid bid exists before connection
-- ============================================================

-- Drop existing policy
DROP POLICY IF EXISTS "Buyers can create connections" ON public.connections;

-- Create new policy with paid bid validation
CREATE POLICY "Buyers can create connections with paid bids" 
ON public.connections FOR INSERT 
WITH CHECK (
  auth.uid() = buyer_id 
  AND EXISTS (
    SELECT 1 FROM public.bids 
    WHERE bids.id = connections.bid_id 
    AND bids.listing_id = connections.listing_id 
    AND bids.seller_id = connections.seller_id 
    AND bids.payment_status = 'paid'
  )
);

-- ============================================================
-- FIX 3: BID PAYMENT BYPASS - Force payment_status to 'pending' on INSERT
-- Prevents client from setting payment_status = 'paid' directly
-- ============================================================

-- Create trigger function to enforce pending payment status on insert
CREATE OR REPLACE FUNCTION public.enforce_pending_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Force payment_status to 'pending' on all new bids
  -- Only webhooks/server functions should update to 'paid'
  NEW.payment_status := 'pending';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS bids_enforce_pending_status ON public.bids;
CREATE TRIGGER bids_enforce_pending_status
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_pending_payment_status();