import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from './supabase'

export interface AuthContext {
  ownerId: string
  keyId: string
}

export async function validateApiKey(request: NextRequest): Promise<AuthContext | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer kr_')) return null

  const rawKey = authHeader.replace('Bearer ', '')
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, owner_id, is_active')
    .eq('key_hash', keyHash)
    .single()

  if (error || !data || !data.is_active) return null

  // Update last_used in background (non-blocking)
  supabaseAdmin
    .from('api_keys')
    .update({ last_used: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {})

  return { ownerId: data.owner_id, keyId: data.id }
}

// Call KairosAI Identity /verify before any agent-to-agent operation
export async function verifyAgentDid(did: string): Promise<boolean> {
  const identityUrl = process.env.KAIROS_IDENTITY_API_URL
  if (!identityUrl) return false

  try {
    const res = await fetch(`${identityUrl}/api/v1/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ did }),
      signal: AbortSignal.timeout(5000),
    })
    const json = await res.json() as { success?: boolean }
    return res.ok && json.success === true
  } catch {
    return false
  }
}
