import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const ownerId = request.headers.get('x-user-id')
  if (!ownerId) return apiError('Unauthorized', 401)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, owner_id')
    .eq('id', id)
    .single()

  if (error || !data) return apiError('API key not found', 404)
  if (data.owner_id !== ownerId) return apiError('Forbidden', 403)

  await supabaseAdmin.from('api_keys').update({ is_active: false }).eq('id', id)

  return apiSuccess({ id, revoked: true })
}
