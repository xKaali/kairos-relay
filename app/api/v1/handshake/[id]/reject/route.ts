import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'
import { logRelayEvent } from '@/lib/events'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  let body: { reason?: string } = {}
  try { body = await request.json() as { reason?: string } } catch { /* optional body */ }

  const { data: handshake, error } = await supabaseAdmin
    .from('handshakes')
    .select('id, from_did, to_did, status')
    .eq('id', id)
    .single()

  if (error || !handshake) return apiError('Handshake not found', 404)
  if (handshake.status !== 'pending') return apiError(`Handshake is already ${handshake.status}`, 400)

  await supabaseAdmin
    .from('handshakes')
    .update({ status: 'rejected', rejection_reason: body.reason ?? null, resolved_at: new Date().toISOString() })
    .eq('id', id)

  logRelayEvent({
    eventType: 'HANDSHAKE_REJECTED',
    fromDid: handshake.from_did,
    toDid: handshake.to_did,
    handshakeId: id,
    metadata: { reason: body.reason },
  }).catch(console.error)

  return apiSuccess({ handshake_id: id, rejected: true })
}
