ALTER TABLE public.workflows
  ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb;

UPDATE public.workflows
  SET trigger_type = CASE
        WHEN trigger_segment IS NULL OR trigger_segment = 'manual' THEN 'manual'
        ELSE 'pipeline_stage'
      END,
      trigger_config = CASE
        WHEN trigger_segment IS NULL OR trigger_segment = 'manual' THEN '{}'::jsonb
        ELSE jsonb_build_object('segment', trigger_segment)
      END
  WHERE trigger_type = 'manual';