-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NULL,
  entity_id uuid NULL,
  metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
DO $$ BEGIN
  CREATE POLICY "Admins can read audit logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Any authenticated user can insert logs for their own actions
DO $$ BEGIN
  CREATE POLICY "Users can insert own audit logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);

-- Payment de-duplication indexes for webhook + verify flows
CREATE UNIQUE INDEX IF NOT EXISTS payments_transaction_ref_uniq
  ON public.payments (transaction_ref)
  WHERE transaction_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS payments_flutterwave_tx_ref_uniq
  ON public.payments (flutterwave_tx_ref)
  WHERE flutterwave_tx_ref IS NOT NULL;