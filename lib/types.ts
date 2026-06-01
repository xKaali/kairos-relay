// ─────────────────────────────────────────────
// Capability
// ─────────────────────────────────────────────

export type CapabilityCategory = 'communication' | 'research' | 'code' | 'data' | 'media' | 'other'
export type AuthMethod = 'bearer' | 'api_key' | 'none'

export interface Capability {
  id: string
  agent_did: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  category: CapabilityCategory | null
  input_schema: Record<string, unknown> | null
  output_schema: Record<string, unknown> | null
  endpoint: string | null
  auth_method: AuthMethod
  is_public: boolean
  is_active: boolean
  price_per_call: number
  call_count: number
  avg_latency_ms: number | null
  created_at: string
  updated_at: string
}

export interface RegisterCapabilityPayload {
  agent_did: string
  name: string
  slug: string
  description?: string
  category?: CapabilityCategory
  input_schema?: Record<string, unknown>
  output_schema?: Record<string, unknown>
  endpoint?: string
  auth_method?: AuthMethod
  is_public?: boolean
  price_per_call?: number
}

export interface DiscoverCapabilitiesQuery {
  category?: CapabilityCategory
  query?: string
  agent_did?: string
  limit?: number
  offset?: number
}

// ─────────────────────────────────────────────
// Delegation
// ─────────────────────────────────────────────

export type DelegationStatus = 'pending' | 'active' | 'completed' | 'expired' | 'revoked'

export interface Delegation {
  id: string
  token_hash: string
  from_did: string
  to_did: string
  capability_id: string | null
  task_description: string | null
  allowed_actions: string[] | null
  max_uses: number
  use_count: number
  expires_at: string
  status: DelegationStatus
  created_at: string
  completed_at: string | null
}

export interface IssueDelegationPayload {
  from_did: string
  to_did: string
  capability_id?: string
  task_description?: string
  allowed_actions?: string[]
  expires_in_minutes?: number
  max_uses?: number
}

// ─────────────────────────────────────────────
// Handshake
// ─────────────────────────────────────────────

export type HandshakeStatus = 'pending' | 'accepted' | 'rejected' | 'expired'

export interface Handshake {
  id: string
  from_did: string
  to_did: string
  capability_id: string | null
  task_description: string | null
  proposed_actions: string[] | null
  status: HandshakeStatus
  rejection_reason: string | null
  delegation_id: string | null
  expires_at: string
  created_at: string
  resolved_at: string | null
}

export interface InitiateHandshakePayload {
  from_did: string
  to_did: string
  capability_id?: string
  task_description?: string
  proposed_actions?: string[]
}

// ─────────────────────────────────────────────
// Network
// ─────────────────────────────────────────────

export type NetworkRole = 'admin' | 'member'

export interface Network {
  id: string
  owner_id: string
  name: string
  description: string | null
  is_public: boolean
  invite_code: string
  member_count: number
  created_at: string
}

export interface NetworkMember {
  id: string
  network_id: string
  agent_did: string
  role: NetworkRole
  joined_at: string
}

// ─────────────────────────────────────────────
// API Key
// ─────────────────────────────────────────────

export interface ApiKey {
  id: string
  owner_id: string
  name: string
  key_hash: string
  key_prefix: string
  last_used: string | null
  is_active: boolean
  created_at: string
}
