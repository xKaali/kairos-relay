import { apiSuccess, apiError } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabase'
import type { CapabilityCategory } from '@/lib/types'

const ALL_CATEGORIES: CapabilityCategory[] = ['communication', 'research', 'code', 'data', 'media', 'other']

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('capabilities')
    .select('category')
    .eq('is_public', true)
    .eq('is_active', true)
    .not('category', 'is', null)

  if (error) {
    console.error('[registry/categories] DB error:', error)
    return apiError('Failed to fetch categories', 500)
  }

  // Count by category
  const counts: Record<string, number> = {}
  for (const cat of ALL_CATEGORIES) counts[cat] = 0

  for (const row of data ?? []) {
    if (row.category && counts[row.category] !== undefined) {
      counts[row.category]++
    }
  }

  const categories = ALL_CATEGORIES.map((category) => ({
    category,
    count: counts[category] ?? 0,
  }))

  return apiSuccess({ categories, total: data?.length ?? 0 })
}
