import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey, verifyAgentDid } from '@/lib/auth'
import { logRelayEvent } from '@/lib/events'
import type { InitiateHandshakePayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  let body: InitiateHandshakePayload
  try {
    body = await request.json() as InitiateHandshakePayload
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const { from_did, to_did } = body
  if (!from_did?.startsWith('did:kairos:')) return apiError('from_did must be a valid did:kairos: DID', 400)
  if (!to_did?.startsWith('did:kairos:')) return apiError('to_did must be a valid did:kairos: DID', 400)

  // Verify both agents exist in Identity
  const [fromValid, toValid] = await Promise.all([
    verifyAgentDid(from_did),
    verifyAgentDid(to_did),
  ])
  if (!fromValid) return apiError('from_did could not be verified with KairosAI Identity', 422)
  if (!toValid) return apiError('to_did could not be verified with KairosAI Identity', 422)

  // Verify capability if provided
  if (body.capability_id) {
    const { data: cap } = await supabaseAdmin
      .from('capabilities')
      .select('id')
      .eq('id', body.capability_id)
      .eq('is_active', true)
      .single()
    if (!cap) return apiError('Capability not found or inactive', 404)
  }

  const { data: handshake, error } = await supabaseAdmin
    .from('handshakes')
    .insert({
      from_did,
      to_did,
      capability_id: body.capability_id ?? null,
      task_description: body.task_description ?? null,
      proposed_actions: body.proposed_actions ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('[handshake/initiate] DB error:', error)
    return apiError('Failed to initiate handshake', 500)
  }

  logRelayEvent({
    eventType: 'HANDSHAKE_INITIATED',
    fromDid: from_did,
    toDid: to_did,
    capabilityId: body.capability_id,
    handshakeId: handshake.id,
  }).catch(console.error)

  return apiSuccess(handshake, 201)
}
