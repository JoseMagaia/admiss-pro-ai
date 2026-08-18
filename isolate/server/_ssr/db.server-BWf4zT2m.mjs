import process from "node:process";
import { Buffer } from "node:buffer";
import { V as Ve } from "../_libs/electric-sql__pglite.mjs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import "../_libs/unenv.mjs";

const schemaSql = `-- Consolidated local schema generated from supabase/migrations
-- for @electric-sql/pglite (in-process Postgres). RLS/policies/auth grants
-- removed; numeric -> double precision; auth.* defaults stripped.

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- whatsapp_messages
CREATE TABLE whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  message_content text NOT NULL DEFAULT '',
  sender text NOT NULL DEFAULT 'lead',
  message_type text NOT NULL DEFAULT 'text',
  ai_response text,
  processed boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now()
);

-- leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  chatwoot_contact_id text,
  chatwoot_conversation_id text,
  lead_name text,
  student_or_parent text,
  course_interest text,
  country_interest text,
  passport_status text,
  academic_status text,
  parent_phone text,
  financial_alignment text,
  parent_confirmation text,
  document_received boolean NOT NULL DEFAULT false,
  qualification_status text NOT NULL DEFAULT 'NEW_LEAD',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX leads_phone_number_idx ON leads (phone_number);

CREATE TRIGGER leads_set_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- conversations
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatwoot_conversation_id text,
  phone_number text NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_agent text,
  human_takeover boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER conversations_set_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- appointments
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text,
  lead_name text,
  appointment_date timestamptz,
  appointment_type text NOT NULL DEFAULT 'booking',
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER appointments_set_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- education_settings (single row)
CREATE TABLE education_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL DEFAULT 'Linkmoore Education',
  company_phone text,
  company_email text,
  office_address text,
  working_hours text,
  active_destinations text,
  active_programs text,
  scholarship_information text,
  whatsapp_webhook_url text,
  chatwoot_url text,
  chatwoot_account_id text,
  chatwoot_inbox_id text,
  chatwoot_api_token text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER education_settings_set_updated_at BEFORE UPDATE ON education_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ai_configuration (single row)
CREATE TABLE ai_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  temperature double precision NOT NULL DEFAULT 0.7,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER ai_configuration_set_updated_at BEFORE UPDATE ON ai_configuration
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- prompt_versions
CREATE TABLE prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number integer NOT NULL DEFAULT 1,
  system_prompt text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text
);

-- ai_variables
CREATE TABLE ai_variables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variable_name text NOT NULL,
  variable_value text NOT NULL DEFAULT '',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ai_variables_name_idx ON ai_variables (variable_name);

CREATE TRIGGER ai_variables_set_updated_at BEFORE UPDATE ON ai_variables
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- http_actions
CREATE TABLE http_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger_stage text NOT NULL,
  url text NOT NULL,
  method text NOT NULL DEFAULT 'POST',
  headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  payload_template text NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER http_actions_set_updated_at BEFORE UPDATE ON http_actions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===== Roles enum =====
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'agent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ===== Profiles table =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE ,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===== User roles table =====
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL ,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ===== AI provider columns =====
ALTER TABLE ai_configuration
  ADD COLUMN IF NOT EXISTS provider_mode text NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS custom_provider text,
  ADD COLUMN IF NOT EXISTS custom_base_url text,
  ADD COLUMN IF NOT EXISTS custom_model text,
  ADD COLUMN IF NOT EXISTS custom_api_key text;

-- ============ chatwoot_workspaces ============
CREATE TABLE chatwoot_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  chatwoot_url text,
  chatwoot_account_id text,
  chatwoot_inbox_id text,
  chatwoot_api_token text,
  enabled boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  use_shared_ai boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============ scheduled_messages ============
CREATE TABLE scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  chatwoot_conversation_id text,
  workspace_id uuid,
  message_content text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- No policies on purpose: accessed only through the trusted server.
CREATE TRIGGER set_scheduled_messages_updated_at
  BEFORE UPDATE ON scheduled_messages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_scheduled_messages_due
  ON scheduled_messages (status, scheduled_for);

-- ============ workspace references ============
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS ai_resumed boolean NOT NULL DEFAULT false;

-- ===================== RESPONDER AGENTS =====================
CREATE TABLE responder_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  workspace_id uuid,
  system_prompt text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  temperature double precision NOT NULL DEFAULT 0.7,
  provider_mode text NOT NULL DEFAULT 'inherit',
  custom_provider text,
  custom_base_url text,
  custom_model text,
  custom_api_key text,
  inherit_variables boolean NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE responder_agent_variables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES responder_agents(id) ON DELETE CASCADE,
  variable_name text NOT NULL,
  variable_value text NOT NULL DEFAULT '',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agent_id, variable_name)
);

-- ===================== WORKFLOWS =====================
CREATE TABLE workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  workspace_id uuid,
  agent_id uuid REFERENCES responder_agents(id) ON DELETE SET NULL,
  trigger_segment text NOT NULL DEFAULT 'manual',
  enabled boolean NOT NULL DEFAULT false,
  graph jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE workflow_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  lead_id uuid,
  phone_number text NOT NULL,
  current_step integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  reacted boolean NOT NULL DEFAULT false,
  next_run_at timestamptz,
  last_step_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workflow_id, phone_number)
);

CREATE INDEX idx_workflow_enrollments_phone ON workflow_enrollments (phone_number);

CREATE INDEX idx_workflow_enrollments_due ON workflow_enrollments (status, next_run_at);

-- ===================== updated_at triggers =====================
CREATE TRIGGER trg_responder_agents_updated BEFORE UPDATE ON responder_agents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_responder_agent_variables_updated BEFORE UPDATE ON responder_agent_variables
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workflows_updated BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workflow_enrollments_updated BEFORE UPDATE ON workflow_enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE meeting_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid,
  phone_number text NOT NULL,
  lead_name text,
  meeting_date timestamptz NOT NULL DEFAULT now(),
  outcome text NOT NULL,
  commitment_level text,
  main_obstacle text,
  next_action text,
  follow_up_date date,
  internal_notes text,
  workflow_triggered text,
  recorded_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER set_meeting_outcomes_updated_at
  BEFORE UPDATE ON meeting_outcomes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_meeting_outcomes_meeting_date ON meeting_outcomes (meeting_date DESC);

CREATE INDEX idx_meeting_outcomes_phone ON meeting_outcomes (phone_number);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_email text,
  actor_role text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

ALTER TABLE workflows
  ADD COLUMN IF NOT EXISTS trigger_type text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ============ OFFERS (opportunity products) ============
CREATE TABLE offers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  products text,
  stage text NOT NULL DEFAULT 'new',
  default_valuation double precision NOT NULL DEFAULT 0,
  expected_liquidity double precision NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============ LEAD OPPORTUNITIES (per-lead values) ============
CREATE TABLE lead_opportunities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL UNIQUE,
  offer_id uuid,
  valuation double precision NOT NULL DEFAULT 0,
  liquidity double precision NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ============ USER PERMISSIONS (granular feature access) ============
CREATE TABLE user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  permission text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

-- updated_at triggers (reuse existing set_updated_at function)
CREATE TRIGGER set_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_lead_opportunities_updated_at
  BEFORE UPDATE ON lead_opportunities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE stage_opportunity_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stage text NOT NULL UNIQUE,
  offer_id uuid,
  valuation double precision NOT NULL DEFAULT 0,
  liquidity double precision NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_stage_opportunity_settings_updated_at
  BEFORE UPDATE ON stage_opportunity_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE report_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled conversation',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TRIGGER update_report_conversations_updated_at
BEFORE UPDATE ON report_conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE offers ADD COLUMN IF NOT EXISTS stages text[] NOT NULL DEFAULT '{}';

ALTER TABLE workflow_enrollments ADD COLUMN IF NOT EXISTS goal_at timestamptz;

CREATE TABLE ai_provider_pool (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  priority integer NOT NULL DEFAULT 0,
  label text NOT NULL DEFAULT '',
  provider text NOT NULL DEFAULT 'openai',
  base_url text,
  models text[] NOT NULL DEFAULT '{}',
  api_key text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TRIGGER update_ai_provider_pool_updated_at
  BEFORE UPDATE ON ai_provider_pool
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE ai_configuration
  ADD COLUMN IF NOT EXISTS fallback_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE chatwoot_workspaces
  ADD COLUMN IF NOT EXISTS provider_type text NOT NULL DEFAULT 'chatwoot',
  ADD COLUMN IF NOT EXISTS evolution_url text,
  ADD COLUMN IF NOT EXISTS evolution_api_key text,
  ADD COLUMN IF NOT EXISTS evolution_instance text;

DO $$ BEGIN
  CREATE TYPE space_status AS ENUM ('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  status space_status NOT NULL DEFAULT 'active',
  plan text NOT NULL DEFAULT 'standard',
  feature_flags jsonb NOT NULL DEFAULT '{"orchestration":true,"advanced":true,"agentic":true,"http_actions":true,"workflows":true,"evolution":true}'::jsonb,
  limits jsonb NOT NULL DEFAULT '{"max_users":100,"max_leads":100000,"max_workflows":200,"max_inboxes":50}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  CREATE TRIGGER spaces_set_updated_at BEFORE UPDATE ON spaces
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS space_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL ,
  role app_role NOT NULL DEFAULT 'agent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_space_members_user ON space_members (user_id);

ALTER TABLE leads                       ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE conversations               ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE whatsapp_messages           ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE appointments                ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE education_settings          ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE ai_configuration            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE ai_variables                ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE prompt_versions             ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE http_actions                ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE chatwoot_workspaces         ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE scheduled_messages          ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE responder_agents            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE workflows                   ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE workflow_enrollments        ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE lead_opportunities          ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE meeting_outcomes            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE offers                      ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE stage_opportunity_settings  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE report_conversations        ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE ai_provider_pool            ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

ALTER TABLE audit_logs                  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS leads_space_phone_idx ON leads (space_id, phone_number);

CREATE UNIQUE INDEX IF NOT EXISTS ai_variables_space_name_idx ON ai_variables (space_id, variable_name);

ALTER TABLE stage_opportunity_settings DROP CONSTRAINT IF EXISTS stage_opportunity_settings_stage_key;

CREATE UNIQUE INDEX IF NOT EXISTS stage_opportunity_settings_space_stage_idx ON stage_opportunity_settings (space_id, stage);

CREATE INDEX IF NOT EXISTS idx_leads_space ON leads (space_id);

CREATE INDEX IF NOT EXISTS idx_conversations_space ON conversations (space_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_space ON whatsapp_messages (space_id);

CREATE INDEX IF NOT EXISTS idx_workflows_space ON workflows (space_id);

CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_space ON workflow_enrollments (space_id);

-- ============ Custom pipelines ============
CREATE TABLE pipelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pipelines_set_updated_at BEFORE UPDATE ON pipelines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_pipelines_space ON pipelines (space_id);

-- ============ Pipeline stages (kanban columns) ============
CREATE TABLE pipeline_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES spaces(id) ON DELETE CASCADE,
  pipeline_id uuid NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  label text NOT NULL,
  stage_keys text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pipeline_stages_set_updated_at BEFORE UPDATE ON pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_pipeline_stages_pipeline ON pipeline_stages (pipeline_id);

-- ============ Offer -> pipeline assignment ============
ALTER TABLE offers ADD COLUMN pipeline_id uuid REFERENCES pipelines(id) ON DELETE SET NULL;

-- Drip Campaigns: bulk outbound messaging with controlled drip scheduling.

-- 1. Campaigns
CREATE TABLE campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL,
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  workspace_id uuid,
  message_template text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  batch_size integer NOT NULL DEFAULT 25,
  delay_seconds integer NOT NULL DEFAULT 2,
  send_rate_per_min integer NOT NULL DEFAULT 60,
  start_at timestamp with time zone,
  end_at timestamp with time zone,
  last_batch_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_campaigns_space ON campaigns(space_id);

CREATE INDEX idx_campaigns_status ON campaigns(status);

-- 2. Campaign recipients
CREATE TABLE campaign_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id uuid NOT NULL,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  lead_id uuid,
  phone_number text NOT NULL,
  name text,
  merge_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  sent_at timestamp with time zone,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  replied_at timestamp with time zone,
  error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, phone_number)
);

CREATE TRIGGER set_campaign_recipients_updated_at
  BEFORE UPDATE ON campaign_recipients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);

CREATE INDEX idx_campaign_recipients_campaign_status ON campaign_recipients(campaign_id, status);

CREATE INDEX idx_campaign_recipients_space_phone ON campaign_recipients(space_id, phone_number);

-- Drip campaign advanced scheduling + message rotation
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS message_variations text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS batch_break_seconds integer NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS send_days integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}'::integer[],
  ADD COLUMN IF NOT EXISTS send_window_start text,
  ADD COLUMN IF NOT EXISTS send_window_end text,
  ADD COLUMN IF NOT EXISTS send_timezone text NOT NULL DEFAULT 'UTC';

-- White-label branding (per-space, stored in education_settings)
ALTER TABLE education_settings
  ADD COLUMN IF NOT EXISTS logo_light_url text,
  ADD COLUMN IF NOT EXISTS logo_dark_url text,
  ADD COLUMN IF NOT EXISTS brand_name text,
  ADD COLUMN IF NOT EXISTS brand_tagline text;

ALTER TABLE education_settings
  ADD COLUMN IF NOT EXISTS logo_scale integer NOT NULL DEFAULT 100;

CREATE TABLE voip_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  provider TEXT NOT NULL DEFAULT 'disabled',
  enabled BOOLEAN NOT NULL DEFAULT false,
  sip_ws_server TEXT,
  sip_domain TEXT,
  sip_uri TEXT,
  sip_username TEXT,
  sip_password TEXT,
  sip_display_name TEXT,
  twilio_account_sid TEXT,
  twilio_api_key_sid TEXT,
  twilio_api_key_secret TEXT,
  twilio_twiml_app_sid TEXT,
  twilio_caller_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (space_id)
);

CREATE TABLE calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  lead_id UUID,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',
  agent_user_id UUID,
  status TEXT NOT NULL DEFAULT 'completed',
  disposition TEXT,
  notes TEXT,
  provider TEXT,
  provider_call_sid TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calls_space_created ON calls (space_id, created_at DESC);

CREATE INDEX idx_calls_space_phone ON calls (space_id, phone_number);

CREATE TABLE call_callbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  lead_id UUID,
  phone_number TEXT NOT NULL,
  agent_user_id UUID,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  notes TEXT,
  from_call_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_callbacks_space_due ON call_callbacks (space_id, status, scheduled_at);

CREATE TABLE dial_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dial_campaigns_space ON dial_campaigns (space_id, created_at DESC);

CREATE TABLE dial_campaign_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  lead_id UUID,
  phone_number TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dial_members_campaign ON dial_campaign_members (campaign_id, position);

CREATE TRIGGER update_voip_settings_updated_at BEFORE UPDATE ON voip_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_callbacks_updated_at BEFORE UPDATE ON call_callbacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dial_campaigns_updated_at BEFORE UPDATE ON dial_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dial_campaign_members_updated_at BEFORE UPDATE ON dial_campaign_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE voip_settings ADD COLUMN IF NOT EXISTS inbound_enabled BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE ring_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  name TEXT NOT NULL,
  ring_seconds INTEGER NOT NULL DEFAULT 20,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ring_groups_space ON ring_groups (space_id, created_at DESC);

CREATE TABLE ring_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL,
  ring_group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ring_group_members_group ON ring_group_members (ring_group_id, position);

CREATE TABLE inbound_routes (
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

CREATE INDEX idx_inbound_routes_did ON inbound_routes (did);

CREATE TRIGGER update_ring_groups_updated_at BEFORE UPDATE ON ring_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ring_group_members_updated_at BEFORE UPDATE ON ring_group_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inbound_routes_updated_at BEFORE UPDATE ON inbound_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================== CALENDAR & AVAILABILITY =====================
CREATE TABLE IF NOT EXISTS calendar_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES spaces(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'manual',
  slot_duration_minutes integer NOT NULL DEFAULT 30,
  buffer_minutes integer NOT NULL DEFAULT 0,
  working_days integer[] NOT NULL DEFAULT '{1,2,3,4,5}',
  working_start text NOT NULL DEFAULT '09:00',
  working_end text NOT NULL DEFAULT '18:00',
  timezone text NOT NULL DEFAULT 'UTC',
  calcom_username text,
  calcom_event_slug text,
  calcom_api_key text,
  google_calendar_id text,
  google_api_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id)
);

CREATE TRIGGER calendar_settings_set_updated_at BEFORE UPDATE ON calendar_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===================== JITSI VIDEO CALLS =====================
CREATE TABLE IF NOT EXISTS jitsi_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES spaces(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  server_url text NOT NULL DEFAULT 'https://meet.jit.si',
  display_name text NOT NULL DEFAULT 'Admissions',
  room_prefix text NOT NULL DEFAULT 'admissions',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id)
);

CREATE TRIGGER jitsi_settings_set_updated_at BEFORE UPDATE ON jitsi_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ===================== LOCAL AUTH (replaces Supabase Auth) =====================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
`;
let _pg = null;
let _ready = null;
function resolveDataDir() {
  if (process.env.PGLITE_DATA_DIR) return process.env.PGLITE_DATA_DIR;
  try {
    const dir = join(process.cwd(), ".pglite");
    mkdirSync(dir, { recursive: true });
    return dir;
  } catch {
    return void 0;
  }
}
function createPglite() {
  const dir = resolveDataDir();
  try {
    return dir ? new Ve(dir) : new Ve();
  } catch (e) {
    console.warn("[local-db] File-backed PGlite failed, falling back to in-memory:", e);
    return new Ve();
  }
}
function splitStatements(sql) {
  const out = [];
  let cur = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inLine = false;
  let inBlock = false;
  let dollar = null;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (inLine) {
      cur += ch;
      if (ch === "\n") inLine = false;
      i++;
      continue;
    }
    if (inBlock) {
      cur += ch;
      if (ch === "*" && next === "/") {
        cur += "/";
        i += 2;
        inBlock = false;
        continue;
      }
      i++;
      continue;
    }
    if (dollar) {
      if (sql.startsWith(dollar, i)) {
        cur += dollar;
        i += dollar.length;
        dollar = null;
        continue;
      }
      cur += ch;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "-" && next === "-") {
      inLine = true;
      cur += ch;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "/" && next === "*") {
      inBlock = true;
      cur += ch;
      i++;
      continue;
    }
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      cur += ch;
      i++;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      cur += ch;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === "$") {
      const m = sql.slice(i).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$/);
      if (m) {
        dollar = m[0];
        cur += dollar;
        i += dollar.length;
        continue;
      }
    }
    if (ch === ";" && !inSingle && !inDouble) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i++;
      continue;
    }
    cur += ch;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
async function applySchema(pg) {
  const IGNORE = /already exists|duplicate_object|duplicate (table|trigger|index|type|function|column|key|constraint)/i;
  for (const stmt of splitStatements(schemaSql)) {
    try {
      await pg.exec(stmt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (IGNORE.test(msg)) continue;
      console.error("[local-db] schema statement failed:", msg.slice(0, 400), "\nSQL:", stmt.slice(0, 240));
      throw e;
    }
  }
}
async function ensureAuthTables(pg) {
  await pg.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      password_hash text NOT NULL,
      full_name text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NOT NULL,
      last_seen_at timestamptz
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token);
  `);
}
async function seed(pg) {
  await pg.exec(
    `INSERT INTO spaces (name, slug, is_default) VALUES ('Default Space', 'default', true)
     ON CONFLICT (slug) DO NOTHING;`
  );
  const { rows } = await pg.query(`SELECT count(*)::int AS n FROM users`);
  if (Number(rows[0]?.n ?? 0) > 0) return;
  const email = process.env.LOCAL_ADMIN_EMAIL || "admin@linkmoore.local";
  const password = process.env.LOCAL_ADMIN_PASSWORD || "admin1234";
  const passwordHash = hashPassword(password);
  const res = await pg.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id`,
    [email, passwordHash, "Platform Admin"]
  );
  const userId = res.rows[0]?.id;
  await pg.query(`INSERT INTO profiles (user_id, email, full_name) VALUES ($1, $2, $3)`, [
    userId,
    email,
    "Platform Admin"
  ]);
  await pg.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, 'super_admin')`, [userId]);
  const sp = await pg.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`);
  if (sp.rows[0]?.id) {
    await pg.query(
      `INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, 'admin')
       ON CONFLICT (space_id, user_id) DO NOTHING`,
      [sp.rows[0].id, userId]
    );
  }
  console.log(`[local-db] Seeded admin account: ${email} / ${password}`);
}
const TENANT_TABLES = [
  "leads",
  "conversations",
  "whatsapp_messages",
  "appointments",
  "education_settings",
  "ai_configuration",
  "ai_variables",
  "prompt_versions",
  "http_actions",
  "chatwoot_workspaces",
  "scheduled_messages",
  "responder_agents",
  "workflows",
  "workflow_enrollments",
  "lead_opportunities",
  "meeting_outcomes",
  "offers",
  "stage_opportunity_settings",
  "report_conversations",
  "ai_provider_pool",
  "audit_logs",
  "voip_settings",
  "calls",
  "call_callbacks",
  "dial_campaigns",
  "dial_campaign_members",
  "ring_groups",
  "ring_group_members",
  "inbound_routes",
  "calendar_settings",
  "jitsi_settings"
];
async function ensureTenantScoping(pg) {
  for (const t of TENANT_TABLES) {
    try {
      await pg.exec(
        `ALTER TABLE "${t}" ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES spaces(id) ON DELETE CASCADE`
      );
    } catch (e) {
      console.warn(`[local-db] Could not scope table ${t}:`, e.message.slice(0, 160));
    }
  }
  const sp = await pg.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`);
  const defId = sp.rows[0]?.id;
  if (defId) {
    for (const t of TENANT_TABLES) {
      try {
        await pg.query(`UPDATE "${t}" SET space_id = $1 WHERE space_id IS NULL`, [defId]);
      } catch {
      }
    }
  }
  try {
    await pg.exec(`
      ALTER TABLE workflow_enrollments ADD COLUMN IF NOT EXISTS context jsonb;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_phone_number_id text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_business_account_id text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_access_token text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_api_version text NOT NULL DEFAULT 'v21.0';
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_verify_token text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_app_secret text;
      ALTER TABLE chatwoot_workspaces ADD COLUMN IF NOT EXISTS waba_display_name text;
      CREATE UNIQUE INDEX IF NOT EXISTS leads_space_phone_idx ON leads (space_id, phone_number);
      CREATE UNIQUE INDEX IF NOT EXISTS ai_variables_space_name_idx ON ai_variables (space_id, variable_name);
      CREATE UNIQUE INDEX IF NOT EXISTS stage_opportunity_settings_space_stage_idx ON stage_opportunity_settings (space_id, stage);
      CREATE INDEX IF NOT EXISTS idx_leads_space ON leads (space_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_space ON conversations (space_id);
      CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_space ON whatsapp_messages (space_id);
      CREATE INDEX IF NOT EXISTS idx_workflows_space ON workflows (space_id);
      CREATE INDEX IF NOT EXISTS idx_workflow_enrollments_space ON workflow_enrollments (space_id);
    `);
  } catch (e) {
    console.warn("[local-db] Tenant indexes skipped:", e.message.slice(0, 160));
  }
}
async function init() {
  if (!_pg) _pg = createPglite();
  await _pg.waitReady;
  await applySchema(_pg);
  await ensureAuthTables(_pg);
  await seed(_pg);
  await ensureTenantScoping(_pg);
  return _pg;
}
function getDb() {
  if (!_ready) _ready = init();
  return _ready;
}
function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const idx = stored.indexOf(":");
  if (idx <= 0) return false;
  const salt = stored.slice(0, idx);
  const expectedHex = stored.slice(idx + 1);
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}
async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString();
  const db = await getDb();
  await db.query(`INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)`, [
    userId,
    token,
    expiresAt
  ]);
  return token;
}
async function getUserBySession(token) {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.full_name
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  );
  const row = rows[0];
  if (!row) return null;
  await db.query(`UPDATE sessions SET last_seen_at = now() WHERE token = $1`, [token]).catch(() => {
  });
  return { id: row.id, email: row.email, full_name: row.full_name };
}
async function getUserByEmail(email) {
  const db = await getDb();
  const { rows } = await db.query(`SELECT id, email, full_name FROM users WHERE lower(email) = lower($1)`, [
    email
  ]);
  const row = rows[0];
  return row ? { id: row.id, email: row.email, full_name: row.full_name } : null;
}
async function getRoleForUser(userId) {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT role FROM user_roles WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1`,
    [userId]
  );
  return rows[0]?.role ?? null;
}
async function deleteSessionByToken(token) {
  const db = await getDb();
  await db.query(`DELETE FROM sessions WHERE token = $1`, [token]);
}
async function createLocalUser(args) {
  const db = await getDb();
  const passwordHash = hashPassword(args.password);
  const res = await db.query(
    `INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id`,
    [args.email, passwordHash, args.full_name]
  );
  const userId = res.rows[0]?.id;
  await db.query(`INSERT INTO profiles (user_id, email, full_name) VALUES ($1, $2, $3)`, [
    userId,
    args.email,
    args.full_name
  ]);
  await db.query(`INSERT INTO user_roles (user_id, role) VALUES ($1, $2)`, [userId, args.role]);
  const sp = await db.query(`SELECT id FROM spaces WHERE is_default = true LIMIT 1`);
  if (sp.rows[0]?.id) {
    await db.query(
      `INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, $3)
         ON CONFLICT (space_id, user_id) DO NOTHING`,
      [sp.rows[0].id, userId, args.role]
    ).catch(() => {
    });
  }
  return { id: userId, email: args.email, full_name: args.full_name };
}
async function deleteLocalUser(userId) {
  const db = await getDb();
  await db.query(`DELETE FROM profiles WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM user_permissions WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM space_members WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM sessions WHERE user_id = $1`, [userId]);
  await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
}
async function hasSuperAdmin() {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT count(*)::int AS n FROM user_roles WHERE role = 'super_admin'`
  );
  return Number(rows[0]?.n ?? 0) > 0;
}
export {
  createLocalUser,
  createSession,
  deleteLocalUser,
  deleteSessionByToken,
  getDb,
  getRoleForUser,
  getUserByEmail,
  getUserBySession,
  hasSuperAdmin,
  hashPassword,
  verifyPassword
};
