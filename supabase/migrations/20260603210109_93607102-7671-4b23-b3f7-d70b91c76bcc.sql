ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS ai_resumed boolean NOT NULL DEFAULT false;