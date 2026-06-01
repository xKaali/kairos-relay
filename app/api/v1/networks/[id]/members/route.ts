import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  const { data, error } = await supabaseAdmin
    .from('network_members')
    .select('*')
    .eq('network_id', id)
    .order('joined_at', { ascending: false })

  if (error) return apiError('Failed to fetch members', 500)

  return apiSuccess({ members: data ?? [], total: data?.length ?? 0 })
}
