CREATE TABLE public.calendars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#6366f1',
  timezone text NOT NULL DEFAULT 'UTC',
  slot_duration_minutes integer NOT NULL DEFAULT 30,
  buffer_minutes integer NOT NULL DEFAULT 0,
  min_notice_minutes integer NOT NULL DEFAULT 60,
  max_days_ahead integer NOT NULL DEFAULT 60,
  is_default boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendars TO authenticated;
GRANT ALL ON public.calendars TO service_role;
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendars_access" ON public.calendars FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER calendars_set_updated_at BEFORE UPDATE ON public.calendars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.calendar_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  calendar_id uuid NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '17:00',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX calendar_availability_calendar_idx ON public.calendar_availability(calendar_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_availability TO authenticated;
GRANT ALL ON public.calendar_availability TO service_role;
ALTER TABLE public.calendar_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_availability_access" ON public.calendar_availability FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER calendar_availability_set_updated_at BEFORE UPDATE ON public.calendar_availability
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.calendar_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  calendar_id uuid NOT NULL REFERENCES public.calendars(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  closed boolean NOT NULL DEFAULT true,
  start_time time,
  end_time time,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX calendar_exceptions_calendar_idx ON public.calendar_exceptions(calendar_id, exception_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_exceptions TO authenticated;
GRANT ALL ON public.calendar_exceptions TO service_role;
ALTER TABLE public.calendar_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calendar_exceptions_access" ON public.calendar_exceptions FOR ALL TO authenticated
  USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()))
  WITH CHECK (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));
CREATE TRIGGER calendar_exceptions_set_updated_at BEFORE UPDATE ON public.calendar_exceptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS calendar_id uuid REFERENCES public.calendars(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 30;