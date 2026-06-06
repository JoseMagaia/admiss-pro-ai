CREATE TABLE public.report_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled conversation',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.report_conversations TO service_role;

ALTER TABLE public.report_conversations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_report_conversations_updated_at
BEFORE UPDATE ON public.report_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();