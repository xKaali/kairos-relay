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
    .from('networks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return apiError('Network not found', 404)

  return apiSuccess(data)
}
