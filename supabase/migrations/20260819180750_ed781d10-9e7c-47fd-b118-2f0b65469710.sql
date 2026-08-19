-- Ticketing, queues, tags and notifications
CREATE TABLE public.ticket_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_queues TO authenticated;
GRANT ALL ON public.ticket_queues TO service_role;
ALTER TABLE public.ticket_queues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queues_read" ON public.ticket_queues FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE POLICY "queues_write" ON public.ticket_queues FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER ticket_queues_set_updated_at BEFORE UPDATE ON public.ticket_queues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#0ea5e9',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_read" ON public.tags FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE POLICY "tags_write" ON public.tags FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER tags_set_updated_at BEFORE UPDATE ON public.tags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  subject text NOT NULL,
  phone_number text,
  lead_id uuid,
  conversation_id uuid,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  queue_id uuid REFERENCES public.ticket_queues(id) ON DELETE SET NULL,
  assigned_user_id uuid,
  created_by uuid,
  created_by_kind text NOT NULL DEFAULT 'human',
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_read" ON public.tickets FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE POLICY "tickets_write" ON public.tickets FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER tickets_set_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX tickets_space_status_idx ON public.tickets (space_id, status);
CREATE INDEX tickets_assigned_idx ON public.tickets (assigned_user_id);

CREATE TABLE public.ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  actor_user_id uuid,
  actor_label text,
  kind text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_events TO authenticated;
GRANT ALL ON public.ticket_events TO service_role;
ALTER TABLE public.ticket_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket_events_read" ON public.ticket_events FOR SELECT TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE POLICY "ticket_events_insert" ON public.ticket_events FOR INSERT TO authenticated
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  user_id uuid,
  target_role app_role,
  title text NOT NULL,
  body text,
  kind text NOT NULL DEFAULT 'info',
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE,
  link_phone text,
  created_by uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_own" ON public.notifications FOR SELECT TO authenticated
  USING (
    (user_id = auth.uid())
    OR (user_id IS NULL AND (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid())))
  );
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_insert_member" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER notifications_set_updated_at BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX notifications_user_idx ON public.notifications (user_id, read_at);

-- Per-user read receipts for broadcast (role/space wide) notifications
CREATE TABLE public.notification_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (notification_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.notification_reads TO authenticated;
GRANT ALL ON public.notification_reads TO service_role;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_reads_own" ON public.notification_reads FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());