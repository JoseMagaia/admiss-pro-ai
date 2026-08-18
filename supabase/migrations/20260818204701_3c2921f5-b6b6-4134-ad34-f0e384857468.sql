ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];
ALTER TABLE public.workflow_enrollments ADD COLUMN IF NOT EXISTS current_node_id text;
CREATE INDEX IF NOT EXISTS leads_tags_idx ON public.leads USING gin (tags);