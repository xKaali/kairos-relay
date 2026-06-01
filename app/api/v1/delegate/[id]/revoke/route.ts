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

  const { data: delegation, error } = await supabaseAdmin
    .from('delegations')
    .select('id, from_did, to_did, status')
    .eq('id', id)
    .single()

  if (error || !delegation) return apiError('Delegation not found', 404)
  if (delegation.status === 'revoked') return apiError('Delegation is already revoked', 400)

  const { error: updateError } = await supabaseAdmin
    .from('delegations')
    .update({ status: 'revoked' })
    .eq('id', id)

  if (updateError) return apiError('Failed to revoke delegation', 500)

  logRelayEvent({
    eventType: 'DELEGATION_REVOKED',
    fromDid: delegation.from_did,
    toDid: delegation.to_did,
    delegationId: id,
  }).catch(console.error)

  return apiSuccess({ id, revoked: true })
}
