-- Create platform_settings table for storing configuration like payment environment
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read platform settings
CREATE POLICY "Admins can read platform settings"
ON public.platform_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update platform settings
CREATE POLICY "Admins can update platform settings"
ON public.platform_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert platform settings
CREATE POLICY "Admins can insert platform settings"
ON public.platform_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default payment environment setting
INSERT INTO public.platform_settings (key, value, description)
VALUES (
  'payment_environment',
  '{"mode": "sandbox", "flutterwave_public_key": "FLWPUBK_TEST-b380399675364f15688edfefa1dedda5-X", "sandbox_public_key": "FLWPUBK_TEST-b380399675364f15688edfefa1dedda5-X", "live_public_key": ""}'::jsonb,
  'Flutterwave payment environment configuration'
);

-- Create trigger to update timestamp on settings change
CREATE OR REPLACE FUNCTION public.update_platform_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_settings_timestamp();