-- Function to get trust discount multiplier (corrected to use plpgsql)
CREATE OR REPLACE FUNCTION public.get_trust_discount(_seller_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trust TEXT;
BEGIN
  SELECT trust_level INTO trust
  FROM public.profiles
  WHERE id = _seller_id;

  RETURN CASE trust
    WHEN 'verified' THEN 0.80
    WHEN 'trusted' THEN 0.90
    WHEN 'low' THEN 1.15
    ELSE 1.0
  END;
END;
$$;