import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'
import { logRelayEvent } from '@/lib/events'
import { SignJWT } from 'jose'
import crypto from 'crypto'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  const { data: handshake, error } = await supabaseAdmin
    .from('handshakes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !handshake) return apiError('Handshake not found', 404)
  if (handshake.status !== 'pending') return apiError(`Handshake is already ${handshake.status}`, 400)
  if (new Date(handshake.expires_at) < new Date()) return apiError('Handshake has expired', 400)

  // Auto-issue delegation token on accept
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  const secret = new TextEncoder().encode(process.env.KAIROS_RELAY_JWT_SECRET!)
  const delegationId = crypto.randomUUID()

  const token = await new SignJWT({
    sub: handshake.to_did,
    iss: handshake.from_did,
    delegation_id: delegationId,
    handshake_id: id,
    capability_id: handshake.capability_id,
    allowed_actions: handshake.proposed_actions ?? [],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret)

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  // Create delegation
  const { data: delegation, error: delError } = await supabaseAdmin
    .from('delegations')
    .insert({
      id: delegationId,
      token_hash: tokenHash,
      from_did: handshake.from_did,
      to_did: handshake.to_did,
      capability_id: handshake.capability_id,
      task_description: handshake.task_description,
      allowed_actions: handshake.proposed_actions,
      max_uses: 1,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    })
    .select()
    .single()

  if (delError) return apiError('Failed to issue delegation token', 500)

  // Update handshake
  await supabaseAdmin
    .from('handshakes')
    .update({ status: 'accepted', delegation_id: delegationId, resolved_at: new Date().toISOString() })
    .eq('id', id)

  logRelayEvent({
    eventType: 'HANDSHAKE_ACCEPTED',
    fromDid: handshake.from_did,
    toDid: handshake.to_did,
    handshakeId: id,
    delegationId,
  }).catch(console.error)

  return apiSuccess({ handshake_id: id, delegation, token })
}
