import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey, verifyAgentDid } from '@/lib/auth'
import { logRelayEvent } from '@/lib/events'
import type { RegisterCapabilityPayload, CapabilityCategory, AuthMethod } from '@/lib/types'

const VALID_CATEGORIES: CapabilityCategory[] = ['communication', 'research', 'code', 'data', 'media', 'other']
const VALID_AUTH_METHODS: AuthMethod[] = ['bearer', 'api_key', 'none']

export async function POST(request: NextRequest) {
  // 1. Authenticate caller via API key
  const auth = await validateApiKey(request)
  if (!auth) {
    return apiError('Unauthorized', 401)
  }

  // 2. Parse body
  let body: RegisterCapabilityPayload
  try {
    body = await request.json() as RegisterCapabilityPayload
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  // 3. Validate required fields
  const { agent_did, name, slug } = body
  if (!agent_did) return apiError('agent_did is required', 400)
  if (!name || name.trim().length === 0) return apiError('name is required', 400)
  if (!slug || slug.trim().length === 0) return apiError('slug is required', 400)

  // Validate slug format: lowercase alphanumeric + hyphens only
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return apiError('slug must be lowercase alphanumeric with hyphens (e.g. summarize-emails)', 400)
  }

  // Validate agent_did format
  if (!agent_did.startsWith('did:kairos:')) {
    return apiError('agent_did must be a valid did:kairos: DID', 400)
  }

  // Validate optional category
  if (body.category && !VALID_CATEGORIES.includes(body.category)) {
    return apiError(`category must be one of: ${VALID_CATEGORIES.join(', ')}`, 400)
  }

  // Validate optional auth_method
  if (body.auth_method && !VALID_AUTH_METHODS.includes(body.auth_method)) {
    return apiError(`auth_method must be one of: ${VALID_AUTH_METHODS.join(', ')}`, 400)
  }

  // Validate price_per_call
  if (body.price_per_call !== undefined && (
    typeof body.price_per_call !== 'number' ||
    body.price_per_call < 0 ||
    !Number.isInteger(body.price_per_call)
  )) {
    return apiError('price_per_call must be a non-negative integer (cents)', 400)
  }

  // 4. Verify agent DID exists and is valid via KairosAI Identity
  const agentValid = await verifyAgentDid(agent_did)
  if (!agentValid) {
    return apiError('Agent DID could not be verified with KairosAI Identity', 422)
  }

  // 5. Check for slug collision on this agent
  const { data: existing } = await supabaseAdmin
    .from('capabilities')
    .select('id')
    .eq('agent_did', agent_did)
    .eq('slug', slug.trim())
    .single()

  if (existing) {
    return apiError(`Capability with slug "${slug}" already exists for this agent`, 409)
  }

  // 6. Insert capability
  const { data: capability, error } = await supabaseAdmin
    .from('capabilities')
    .insert({
      agent_did: agent_did.trim(),
      owner_id: auth.ownerId,
      name: name.trim(),
      slug: slug.trim(),
      description: body.description?.trim() ?? null,
      category: body.category ?? null,
      input_schema: body.input_schema ?? null,
      output_schema: body.output_schema ?? null,
      endpoint: body.endpoint?.trim() ?? null,
      auth_method: body.auth_method ?? 'none',
      is_public: body.is_public ?? true,
      is_active: true,
      price_per_call: body.price_per_call ?? 0,
    })
    .select()
    .single()

  if (error) {
    console.error('[capabilities/register] DB insert error:', error)
    return apiError('Failed to register capability', 500)
  }

  // 7. Log event (non-blocking)
  logRelayEvent({
    eventType: 'CAPABILITY_REGISTERED',
    fromDid: agent_did,
    capabilityId: capability.id,
    metadata: { name, slug, category: body.category },
  }).catch(console.error)

  return apiSuccess(capability, 201)
}
