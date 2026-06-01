-- KairosAI Relay — Initial Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- capabilities
-- ─────────────────────────────────────────────
create table if not exists capabilities (
  id              uuid primary key default gen_random_uuid(),
  agent_did       text not null,
  owner_id        uuid not null,
  name            text not null,
  slug            text not null,
  description     text,
  category        text check (category in ('communication','research','code','data','media','other')),
  input_schema    jsonb,
  output_schema   jsonb,
  endpoint        text,
  auth_method     text check (auth_method in ('bearer','api_key','none')) default 'none',
  is_public       boolean default true,
  is_active       boolean default true,
  price_per_call  integer default 0,
  call_count      bigint default 0,
  avg_latency_ms  integer,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),

  -- slug must be unique per agent
  unique (agent_did, slug)
);

create index capabilities_agent_did_idx on capabilities (agent_did);
create index capabilities_category_idx on capabilities (category);
create index capabilities_is_public_idx on capabilities (is_public, is_active);

-- ─────────────────────────────────────────────
-- delegations
-- ─────────────────────────────────────────────
create table if not exists delegations (
  id              uuid primary key default gen_random_uuid(),
  token_hash      text not null unique,
  from_did        text not null,
  to_did          text not null,
  capability_id   uuid references capabilities (id) on delete set null,
  task_description text,
  allowed_actions  text[],
  max_uses        integer default 1,
  use_count       integer default 0,
  expires_at      timestamptz not null,
  status          text check (status in ('pending','active','completed','expired','revoked')) default 'active',
  created_at      timestamptz default now(),
  completed_at    timestamptz
);

create index delegations_from_did_idx on delegations (from_did);
create index delegations_to_did_idx on delegations (to_did);
create index delegations_status_idx on delegations (status);
create index delegations_token_hash_idx on delegations (token_hash);

-- ─────────────────────────────────────────────
-- networks
-- ─────────────────────────────────────────────
create table if not exists networks (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null,
  name            text not null,
  description     text,
  is_public       boolean default false,
  invite_code     text unique default encode(gen_random_bytes(12), 'hex'),
  member_count    integer default 0,
  created_at      timestamptz default now()
);

create index networks_owner_id_idx on networks (owner_id);

-- ─────────────────────────────────────────────
-- network_members
-- ─────────────────────────────────────────────
create table if not exists network_members (
  id          uuid primary key default gen_random_uuid(),
  network_id  uuid not null references networks (id) on delete cascade,
  agent_did   text not null,
  role        text check (role in ('admin','member')) default 'member',
  joined_at   timestamptz default now(),

  unique (network_id, agent_did)
);

create index network_members_network_id_idx on network_members (network_id);
create index network_members_agent_did_idx on network_members (agent_did);

-- ─────────────────────────────────────────────
-- handshakes
-- ─────────────────────────────────────────────
create table if not exists handshakes (
  id              uuid primary key default gen_random_uuid(),
  from_did        text not null,
  to_did          text not null,
  capability_id   uuid references capabilities (id) on delete set null,
  task_description text,
  proposed_actions text[],
  status          text check (status in ('pending','accepted','rejected','expired')) default 'pending',
  rejection_reason text,
  delegation_id   uuid references delegations (id) on delete set null,
  expires_at      timestamptz default (now() + interval '10 minutes'),
  created_at      timestamptz default now(),
  resolved_at     timestamptz
);

create index handshakes_from_did_idx on handshakes (from_did);
create index handshakes_to_did_idx on handshakes (to_did);
create index handshakes_status_idx on handshakes (status);

-- ─────────────────────────────────────────────
-- relay_events (audit log)
-- ─────────────────────────────────────────────
create table if not exists relay_events (
  id              uuid primary key default gen_random_uuid(),
  event_type      text not null check (event_type in (
                    'CAPABILITY_REGISTERED',
                    'CAPABILITY_UPDATED',
                    'CAPABILITY_DEACTIVATED',
                    'DELEGATION_ISSUED',
                    'DELEGATION_USED',
                    'DELEGATION_REVOKED',
                    'HANDSHAKE_INITIATED',
                    'HANDSHAKE_ACCEPTED',
                    'HANDSHAKE_REJECTED'
                  )),
  from_did        text,
  to_did          text,
  capability_id   uuid,
  delegation_id   uuid,
  handshake_id    uuid,
  metadata        jsonb,
  created_at      timestamptz default now()
);

-- relay_events is append-only — no updates or deletes
create rule relay_events_no_update as on update to relay_events do instead nothing;
create rule relay_events_no_delete as on delete to relay_events do instead nothing;

create index relay_events_event_type_idx on relay_events (event_type);
create index relay_events_from_did_idx on relay_events (from_did);
create index relay_events_created_at_idx on relay_events (created_at desc);

-- ─────────────────────────────────────────────
-- api_keys
-- ─────────────────────────────────────────────
create table if not exists api_keys (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null,
  name        text not null,
  key_hash    text not null unique,
  key_prefix  text not null,
  last_used   timestamptz,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

create index api_keys_owner_id_idx on api_keys (owner_id);
create index api_keys_key_hash_idx on api_keys (key_hash);

-- ─────────────────────────────────────────────
-- updated_at trigger for capabilities
-- ─────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger capabilities_updated_at
  before update on capabilities
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────
-- RLS policies
-- ─────────────────────────────────────────────
alter table capabilities enable row level security;
alter table delegations enable row level security;
alter table networks enable row level security;
alter table network_members enable row level security;
alter table handshakes enable row level security;
alter table relay_events enable row level security;
alter table api_keys enable row level security;

-- Public can read public active capabilities (for /registry)
create policy "public_read_capabilities"
  on capabilities for select
  using (is_public = true and is_active = true);

-- Owners can manage their own capabilities (via service role / supabaseAdmin)
-- Note: all authenticated writes go through supabaseAdmin which bypasses RLS

-- relay_events readable by service role only (no public RLS select policy)
