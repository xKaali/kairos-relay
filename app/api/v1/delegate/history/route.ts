import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'

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

  if (did) query = query.or(`from_did.eq.${did},to_did.eq.${did}`)
  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return apiError('Failed to fetch delegation history', 500)

  return apiSuccess({ delegations: data ?? [], total: count ?? 0, limit, offset })
}
