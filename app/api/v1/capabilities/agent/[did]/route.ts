import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ did: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { did } = await params
  const decodedDid = decodeURIComponent(did)

  if (!decodedDid.startsWith('did:kairos:')) {
    return apiError('Invalid DID format — must start with did:kairos:', 400)
  }

  const { data, error } = await supabaseAdmin
    .from('capabilities')
    .select('*')
    .eq('agent_did', decodedDid)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[capabilities/agent/:did] DB error:', error)
    return apiError('Failed to fetch capabilities', 500)
  }

  return apiSuccess({
    agent_did: decodedDid,
    capabilities: data ?? [],
    total: data?.length ?? 0,
  })
}
