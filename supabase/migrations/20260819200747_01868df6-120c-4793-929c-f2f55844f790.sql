ALTER TABLE public.whatsapp_messages
  ADD COLUMN IF NOT EXISTS attachment_path text;

CREATE TABLE public.waba_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.chatwoot_workspaces(id) ON DELETE CASCADE,
  meta_template_id text,
  name text NOT NULL,
  language text NOT NULL DEFAULT 'en_US',
  category text NOT NULL DEFAULT 'UTILITY',
  status text NOT NULL DEFAULT 'DRAFT',
  rejection_reason text,
  components jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  submitted_at timestamp with time zone,
  last_synced_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT waba_templates_name_format CHECK (name ~ '^[a-z0-9_]+$'),
  CONSTRAINT waba_templates_category_check CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  CONSTRAINT waba_templates_status_check CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'IN_APPEAL')),
  UNIQUE (workspace_id, name, language)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waba_templates TO authenticated;
GRANT ALL ON public.waba_templates TO service_role;
ALTER TABLE public.waba_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Space members view WABA templates"
ON public.waba_templates
FOR SELECT
TO authenticated
USING (private.is_space_member(space_id, auth.uid()) OR private.is_super_admin(auth.uid()));

CREATE POLICY "Space admins create WABA templates"
ON public.waba_templates
FOR INSERT
TO authenticated
WITH CHECK (
  private.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = waba_templates.space_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('super_admin'::public.app_role, 'admin'::public.app_role)
  )
);

CREATE POLICY "Space admins update WABA templates"
ON public.waba_templates
FOR UPDATE
TO authenticated
USING (
  private.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = waba_templates.space_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('super_admin'::public.app_role, 'admin'::public.app_role)
  )
)
WITH CHECK (
  private.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = waba_templates.space_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('super_admin'::public.app_role, 'admin'::public.app_role)
  )
);

CREATE POLICY "Space admins delete WABA templates"
ON public.waba_templates
FOR DELETE
TO authenticated
USING (
  private.is_super_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.space_members sm
    WHERE sm.space_id = waba_templates.space_id
      AND sm.user_id = auth.uid()
      AND sm.role IN ('super_admin'::public.app_role, 'admin'::public.app_role)
  )
);

CREATE INDEX idx_waba_templates_space ON public.waba_templates(space_id);
CREATE INDEX idx_waba_templates_workspace_status ON public.waba_templates(workspace_id, status);
CREATE TRIGGER waba_templates_set_updated_at
  BEFORE UPDATE ON public.waba_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();