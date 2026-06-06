ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS stages text[] NOT NULL DEFAULT '{}';

UPDATE public.offers
SET stages = ARRAY[stage]
WHERE (stages IS NULL OR array_length(stages, 1) IS NULL) AND stage IS NOT NULL AND stage <> '';