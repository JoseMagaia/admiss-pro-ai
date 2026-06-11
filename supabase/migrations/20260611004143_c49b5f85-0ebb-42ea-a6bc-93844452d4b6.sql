-- ============ Custom pipelines ============
CREATE TABLE public.pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipelines TO authenticated;
GRANT ALL ON public.pipelines TO service_role;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pipelines_set_updated_at BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_pipelines_space ON public.pipelines (space_id);

-- ============ Pipeline stages (kanban columns) ============
CREATE TABLE public.pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE,
  pipeline_id uuid NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  label text NOT NULL,
  stage_keys text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipeline_stages TO authenticated;
GRANT ALL ON public.pipeline_stages TO service_role;
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pipeline_stages_set_updated_at BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_pipeline_stages_pipeline ON public.pipeline_stages (pipeline_id);

-- ============ Offer -> pipeline assignment ============
ALTER TABLE public.offers ADD COLUMN pipeline_id uuid REFERENCES public.pipelines(id) ON DELETE SET NULL;

-- ============ Seed a Default "Admissions Pipeline" per existing space ============
DO $$
DECLARE s record; pid uuid;
BEGIN
  FOR s IN SELECT id FROM public.spaces LOOP
    INSERT INTO public.pipelines (space_id, name, is_default, position)
    VALUES (s.id, 'Admissions Pipeline', true, 0)
    RETURNING id INTO pid;

    INSERT INTO public.pipeline_stages (space_id, pipeline_id, label, stage_keys, position) VALUES
      (s.id, pid, 'New Lead', ARRAY['NEW_LEAD','NAME_CAPTURED'], 0),
      (s.id, pid, 'Qualification', ARRAY['STRUCTURAL_CONFIRMATION','COURSE_IDENTIFIED','DESTINATION_IDENTIFIED','ACADEMIC_PROFILE_VERIFIED','DOCUMENT_REQUESTED','FINANCIAL_ALIGNMENT','PARENT_CONTACT_RECEIVED'], 1),
      (s.id, pid, 'Qualified', ARRAY['QUALIFIED'], 2),
      (s.id, pid, 'Booking Pending', ARRAY['BOOKING_REQUEST_CREATED'], 3),
      (s.id, pid, 'Meeting Scheduled', ARRAY['BOOKING_CONFIRMATION_CALL','SPECIALIST_CONSULTATION'], 4),
      (s.id, pid, 'Payment Pending', ARRAY['PAYMENT_ACTIVATION'], 5),
      (s.id, pid, 'Onboarding', ARRAY['ONBOARDING'], 6),
      (s.id, pid, 'Disqualified', ARRAY['DISQUALIFIED'], 7);
  END LOOP;
END $$;

-- ============ Migrate legacy per-stage opportunity settings to new stage ids ============
UPDATE public.stage_opportunity_settings sos
SET stage = ps.id::text
FROM public.pipeline_stages ps
JOIN public.pipelines p ON p.id = ps.pipeline_id AND p.is_default
WHERE ps.space_id = sos.space_id
  AND (
       (sos.stage = 'new' AND ps.label = 'New Lead')
    OR (sos.stage = 'qualification' AND ps.label = 'Qualification')
    OR (sos.stage = 'qualified' AND ps.label = 'Qualified')
    OR (sos.stage = 'booking' AND ps.label = 'Booking Pending')
    OR (sos.stage = 'meeting' AND ps.label = 'Meeting Scheduled')
    OR (sos.stage = 'payment' AND ps.label = 'Payment Pending')
    OR (sos.stage = 'onboarding' AND ps.label = 'Onboarding')
    OR (sos.stage = 'disqualified' AND ps.label = 'Disqualified')
  );