import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import { validateApiKey } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  let body: { name?: string; description?: string; is_public?: boolean }
  try {
    body = await request.json() as typeof body
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  if (!body.name?.trim()) return apiError('name is required', 400)

  const { data: network, error } = await supabaseAdmin
    .from('networks')
    .insert({
      owner_id: auth.ownerId,
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      is_public: body.is_public ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error('[networks] POST error:', error)
    return apiError('Failed to create network', 500)
  }

  return apiSuccess(network, 201)
}

export async function GET(request: NextRequest) {
  const auth = await validateApiKey(request)
  if (!auth) return apiError('Unauthorized', 401)

  const { data, error } = await supabaseAdmin
    .from('networks')
    .select('*')
    .eq('owner_id', auth.ownerId)
    .order('created_at', { ascending: false })

  if (error) return apiError('Failed to fetch networks', 500)

  return apiSuccess({ networks: data ?? [] })
}
