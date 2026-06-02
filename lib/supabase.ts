import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Anon client — safe to initialize with empty strings at build time
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)

// Admin client — lazily initialized at runtime only
let _admin: SupabaseClient | null = null

export const supabaseAdmin: SupabaseClient = new Proxy(
  {} as SupabaseClient,
  {
    get(_target, prop: string | symbol) {
      if (!_admin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!url || !key) throw new Error('Supabase env vars not set')
        _admin = createClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      }
      const value = (_admin as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? value.bind(_admin) : value
    },
  }
)
