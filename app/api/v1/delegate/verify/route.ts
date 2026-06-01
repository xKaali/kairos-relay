import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { logRelayEvent } from '@/lib/events'
import { jwtVerify } from 'jose'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  let body: { token?: string }
  try {
    body = await request.json() as { token?: string }
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  if (!body.token) return apiError('token is required', 400)

  // Verify JWT signature
  const secret = new TextEncoder().encode(process.env.KAIROS_RELAY_JWT_SECRET!)
  let payload: Record<string, unknown>
  try {
    const { payload: p } = await jwtVerify(body.token, secret)
    payload = p as Record<string, unknown>
  } catch {
    return apiError('Invalid or expired delegation token', 401)
  }

  // Look up in DB by hash
  const tokenHash = crypto.createHash('sha256').update(body.token).digest('hex')
  const { data: delegation, error } = await supabaseAdmin
    .from('delegations')
    .select('*')
    .eq('token_hash', tokenHash)
    .single()

  if (error || !delegation) return apiError('Delegation not found', 404)
  if (delegation.status === 'revoked') return apiError('Delegation has been revoked', 401)
  if (delegation.status === 'expired' || new Date(delegation.expires_at) < new Date()) {
    return apiError('Delegation has expired', 401)
  }
  if (delegation.use_count >= delegation.max_uses) {
    return apiError('Delegation has reached its maximum use count', 401)
  }

  // Increment use count
  await supabaseAdmin
    .from('delegations')
    .update({ use_count: delegation.use_count + 1 })
    .eq('id', delegation.id)

  logRelayEvent({
    eventType: 'DELEGATION_USED',
    fromDid: delegation.from_did,
    toDid: delegation.to_did,
    delegationId: delegation.id,
    metadata: { use_count: delegation.use_count + 1 },
  }).catch(console.error)

  return apiSuccess({
    valid: true,
    delegation: {
      id: delegation.id,
      from_did: delegation.from_did,
      to_did: delegation.to_did,
      capability_id: delegation.capability_id,
      task_description: delegation.task_description,
      allowed_actions: delegation.allowed_actions,
      expires_at: delegation.expires_at,
      use_count: delegation.use_count + 1,
      max_uses: delegation.max_uses,
    },
    claims: payload,
  })
}
