import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'
import { logRelayEvent } from '@/lib/events'
import { SignJWT } from 'jose'
import crypto from 'crypto'
import type { IssueDelegationPayload } from '@/lib/types'

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  let body: IssueDelegationPayload
  try {
    body = await request.json() as IssueDelegationPayload
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const { from_did, to_did } = body
  if (!from_did?.startsWith('did:kairos:')) return apiError('from_did must be a valid did:kairos: DID', 400)
  if (!to_did?.startsWith('did:kairos:')) return apiError('to_did must be a valid did:kairos: DID', 400)
  if (from_did === to_did) return apiError('from_did and to_did must be different agents', 400)

  const expiresInMinutes = Math.min(Math.max(body.expires_in_minutes ?? 10, 1), 60)
  const maxUses = Math.min(Math.max(body.max_uses ?? 1, 1), 100)
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  // Verify capability exists if provided
  if (body.capability_id) {
    const { data: cap } = await supabaseAdmin
      .from('capabilities')
      .select('id')
      .eq('id', body.capability_id)
      .eq('is_active', true)
      .single()
    if (!cap) return apiError('Capability not found or inactive', 404)
  }

  // Sign the delegation JWT
  const secret = new TextEncoder().encode(process.env.KAIROS_RELAY_JWT_SECRET!)
  const delegationId = crypto.randomUUID()

  const token = await new SignJWT({
    sub: to_did,
    iss: from_did,
    delegation_id: delegationId,
    capability_id: body.capability_id ?? null,
    task_description: body.task_description ?? null,
    allowed_actions: body.allowed_actions ?? [],
    max_uses: maxUses,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret)

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const { data: delegation, error } = await supabaseAdmin
    .from('delegations')
    .insert({
      id: delegationId,
      token_hash: tokenHash,
      from_did,
      to_did,
      capability_id: body.capability_id ?? null,
      task_description: body.task_description ?? null,
      allowed_actions: body.allowed_actions ?? null,
      max_uses: maxUses,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('[delegate] DB insert error:', error)
    return apiError('Failed to issue delegation', 500)
  }

  logRelayEvent({
    eventType: 'DELEGATION_ISSUED',
    fromDid: from_did,
    toDid: to_did,
    capabilityId: body.capability_id,
    delegationId,
    metadata: { task_description: body.task_description, expires_in_minutes: expiresInMinutes },
  }).catch(console.error)

  return apiSuccess({ token, delegation }, 201)
}

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  const { searchParams } = request.nextUrl
  const did = searchParams.get('did')
  const status = searchParams.get('status')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 100)
  const offset = Math.max(parseInt(searchParams.get('offset') ?? '0', 10) || 0, 0)

  let query = supabaseAdmin
    .from('delegations')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (did) {
    query = query.or(`from_did.eq.${did},to_did.eq.${did}`)
  }
  if (status) {
    query = query.eq('status', status)
  }

  const { data, error, count } = await query
  if (error) return apiError('Failed to fetch delegations', 500)

  return apiSuccess({ delegations: data ?? [], total: count ?? 0, limit, offset })
}
