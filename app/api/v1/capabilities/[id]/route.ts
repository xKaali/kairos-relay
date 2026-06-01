import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'
import { logRelayEvent } from '@/lib/events'
import type { CapabilityCategory, AuthMethod } from '@/lib/types'

const VALID_CATEGORIES: CapabilityCategory[] = ['communication', 'research', 'code', 'data', 'media', 'other']
const VALID_AUTH_METHODS: AuthMethod[] = ['bearer', 'api_key', 'none']

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/v1/capabilities/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('capabilities')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return apiError('Capability not found', 404)

  // Only return non-public capabilities if they are active
  if (!data.is_active) return apiError('Capability not found', 404)

  return apiSuccess(data)
}

// PUT /api/v1/capabilities/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  let body: Record<string, unknown>
  try {
    body = await request.json() as Record<string, unknown>
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  // Confirm ownership
  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('capabilities')
    .select('id, owner_id, agent_did, slug')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return apiError('Capability not found', 404)
  if (existing.owner_id !== auth.ownerId) return apiError('Forbidden', 403)

  // Build update payload — only include provided fields
  const updates: Record<string, unknown> = {}

  if (typeof body.name === 'string' && body.name.trim()) {
    updates.name = body.name.trim()
  }
  if (typeof body.description === 'string') {
    updates.description = body.description.trim() || null
  }
  if (body.category !== undefined) {
    if (!VALID_CATEGORIES.includes(body.category as CapabilityCategory)) {
      return apiError(`category must be one of: ${VALID_CATEGORIES.join(', ')}`, 400)
    }
    updates.category = body.category
  }
  if (body.auth_method !== undefined) {
    if (!VALID_AUTH_METHODS.includes(body.auth_method as AuthMethod)) {
      return apiError(`auth_method must be one of: ${VALID_AUTH_METHODS.join(', ')}`, 400)
    }
    updates.auth_method = body.auth_method
  }
  if (body.input_schema !== undefined) updates.input_schema = body.input_schema
  if (body.output_schema !== undefined) updates.output_schema = body.output_schema
  if (typeof body.endpoint === 'string') updates.endpoint = body.endpoint.trim() || null
  if (typeof body.is_public === 'boolean') updates.is_public = body.is_public
  if (typeof body.price_per_call === 'number' && Number.isInteger(body.price_per_call) && body.price_per_call >= 0) {
    updates.price_per_call = body.price_per_call
  }

  if (Object.keys(updates).length === 0) {
    return apiError('No valid fields to update', 400)
  }

  const { data: updated, error } = await supabaseAdmin
    .from('capabilities')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[capabilities/:id] PUT error:', error)
    return apiError('Failed to update capability', 500)
  }

  logRelayEvent({
    eventType: 'CAPABILITY_UPDATED',
    fromDid: existing.agent_did,
    capabilityId: id,
    metadata: { updated_fields: Object.keys(updates) },
  }).catch(console.error)

  return apiSuccess(updated)
}

// DELETE /api/v1/capabilities/:id — soft delete (deactivate)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('capabilities')
    .select('id, owner_id, agent_did')
    .eq('id', id)
    .single()

  if (fetchError || !existing) return apiError('Capability not found', 404)
  if (existing.owner_id !== auth.ownerId) return apiError('Forbidden', 403)

  const { error } = await supabaseAdmin
    .from('capabilities')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('[capabilities/:id] DELETE error:', error)
    return apiError('Failed to deactivate capability', 500)
  }

  logRelayEvent({
    eventType: 'CAPABILITY_DEACTIVATED',
    fromDid: existing.agent_did,
    capabilityId: id,
  }).catch(console.error)

  return apiSuccess({ id, deactivated: true })
}
