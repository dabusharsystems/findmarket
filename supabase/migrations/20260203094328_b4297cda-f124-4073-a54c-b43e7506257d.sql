-- Add 'either' to delivery_preference enum (alias for 'both')
ALTER TYPE public.delivery_preference ADD VALUE IF NOT EXISTS 'either';

-- Add 'whatsapp' and 'any' to contact_method enum
ALTER TYPE public.contact_method ADD VALUE IF NOT EXISTS 'whatsapp';
ALTER TYPE public.contact_method ADD VALUE IF NOT EXISTS 'any';