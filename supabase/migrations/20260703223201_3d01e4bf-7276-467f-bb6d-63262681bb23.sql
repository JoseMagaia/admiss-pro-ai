ALTER TABLE public.voip_settings ADD COLUMN IF NOT EXISTS inbound_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.ring_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  name TEXT NOT NULL,
  ring_seconds INTEGER NOT NULL DEFAULT 20,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ring_groups TO service_role;
ALTER TABLE public.ring_groups ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ring_groups_space ON public.ring_groups (space_id, created_at DESC);

CREATE TABLE public.ring_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  ring_group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.ring_group_members TO service_role;
ALTER TABLE public.ring_group_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_ring_group_members_group ON public.ring_group_members (ring_group_id, position);

CREATE TABLE public.inbound_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  did TEXT NOT NULL,
  ring_group_id UUID,
  no_answer_action TEXT NOT NULL DEFAULT 'hangup',
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (space_id, did)
);
GRANT ALL ON public.inbound_routes TO service_role;
ALTER TABLE public.inbound_routes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_inbound_routes_did ON public.inbound_routes (did);

CREATE TRIGGER update_ring_groups_updated_at BEFORE UPDATE ON public.ring_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ring_group_members_updated_at BEFORE UPDATE ON public.ring_group_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inbound_routes_updated_at BEFORE UPDATE ON public.inbound_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();