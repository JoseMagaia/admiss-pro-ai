-- Lead notes -------------------------------------------------------------
CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  phone_number text,
  body text NOT NULL,
  author_user_id uuid,
  author_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_notes TO authenticated;
GRANT ALL ON public.lead_notes TO service_role;
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lead_notes_read" ON public.lead_notes FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE POLICY "lead_notes_write" ON public.lead_notes FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER lead_notes_set_updated_at BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX lead_notes_lead_idx ON public.lead_notes (lead_id, created_at DESC);
CREATE INDEX lead_notes_phone_idx ON public.lead_notes (phone_number, created_at DESC);

-- Queue staffing ----------------------------------------------------------
CREATE TABLE public.ticket_queue_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  queue_id uuid NOT NULL REFERENCES public.ticket_queues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (queue_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_queue_members TO authenticated;
GRANT ALL ON public.ticket_queue_members TO service_role;
ALTER TABLE public.ticket_queue_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queue_members_read" ON public.ticket_queue_members FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE POLICY "queue_members_write" ON public.ticket_queue_members FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

-- AI handoff routing ------------------------------------------------------
ALTER TABLE public.ticket_queues
  ADD COLUMN IF NOT EXISTS ai_handoff_stages text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS is_ai_default boolean NOT NULL DEFAULT false;