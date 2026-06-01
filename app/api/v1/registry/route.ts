import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import type { CapabilityCategory } from '@/lib/types'

const VALID_CATEGORIES: CapabilityCategory[] = ['communication', 'research', 'code', 'data', 'media', 'other']

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const category = searchParams.get('category') as CapabilityCategory | null
  const query = searchParams.get('query')?.trim()
  const rawLimit = searchParams.get('limit')
  const rawOffset = searchParams.get('offset')

  if (category && !VALID_CATEGORIES.includes(category)) {
    return apiError(`category must be one of: ${VALID_CATEGORIES.join(', ')}`, 400)
  }

  const limit = Math.min(Math.max(parseInt(rawLimit ?? '20', 10) || 20, 1), 100)
  const offset = Math.max(parseInt(rawOffset ?? '0', 10) || 0, 0)

  let dbQuery = supabaseAdmin
    .from('capabilities')
    .select(
      'id, name, slug, description, category, agent_did, endpoint, auth_method, is_public, price_per_call, call_count, avg_latency_ms, created_at',
      { count: 'exact' }
    )
    .eq('is_public', true)
    .eq('is_active', true)
    .order('call_count', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) dbQuery = dbQuery.eq('category', category)
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
  }

  const { data, error, count } = await dbQuery

  if (error) {
    console.error('[registry] DB error:', error)
    return apiError('Failed to fetch registry', 500)
  }

  return apiSuccess({
    capabilities: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
