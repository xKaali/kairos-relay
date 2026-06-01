import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey, verifyAgentDid } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  let body: { agent_did?: string; invite_code?: string }
  try {
    body = await request.json() as typeof body
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  if (!body.agent_did?.startsWith('did:kairos:')) return apiError('agent_did must be a valid did:kairos: DID', 400)

  const agentValid = await verifyAgentDid(body.agent_did)
  if (!agentValid) return apiError('Agent DID could not be verified with KairosAI Identity', 422)

  // Fetch network
  const { data: network, error: netError } = await supabaseAdmin
    .from('networks')
    .select('id, is_public, invite_code')
    .eq('id', id)
    .single()

  if (netError || !network) return apiError('Network not found', 404)

  // Private networks require invite code
  if (!network.is_public) {
    if (!body.invite_code) return apiError('invite_code required for private networks', 400)
    if (body.invite_code !== network.invite_code) return apiError('Invalid invite code', 403)
  }

  // Check not already a member
  const { data: existing } = await supabaseAdmin
    .from('network_members')
    .select('id')
    .eq('network_id', id)
    .eq('agent_did', body.agent_did)
    .single()

  if (existing) return apiError('Agent is already a member of this network', 409)

  const { data: member, error: memberError } = await supabaseAdmin
    .from('network_members')
    .insert({ network_id: id, agent_did: body.agent_did, role: 'member' })
    .select()
    .single()

  if (memberError) return apiError('Failed to join network', 500)

  // Increment member count
  // member_count is updated via DB trigger (see migration)

  return apiSuccess(member, 201)
}
