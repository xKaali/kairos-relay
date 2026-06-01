import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

// These routes use x-user-id header set from authenticated client (session-gated page)
function getOwnerFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-user-id')
}

export async function POST(request: NextRequest) {
  const ownerId = getOwnerFromRequest(request)
  if (!ownerId) return apiError('Unauthorized', 401)

  let body: { name?: string }
  try {
    body = await request.json() as { name?: string }
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  if (!body.name?.trim()) return apiError('name is required', 400)

  // Generate kr_ prefixed key
  const rawKey = `kr_${crypto.randomBytes(32).toString('hex')}`
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 12)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      owner_id: ownerId,
      name: body.name.trim(),
      key_hash: keyHash,
      key_prefix: keyPrefix,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('[api-keys] POST error:', error)
    return apiError('Failed to create API key', 500)
  }

  // Return the raw key once — never stored in plaintext
  return apiSuccess({ key: rawKey, id: data.id, name: data.name, key_prefix: keyPrefix }, 201)
}

export async function GET(request: NextRequest) {
  const ownerId = getOwnerFromRequest(request)
  if (!ownerId) return apiError('Unauthorized', 401)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, last_used, is_active, created_at')
    .eq('owner_id', ownerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return apiError('Failed to fetch API keys', 500)

  return apiSuccess({ keys: data ?? [] })
}
