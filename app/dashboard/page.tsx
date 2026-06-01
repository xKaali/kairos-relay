import DashboardLayout from '@/components/DashboardLayout'
import DashboardClient from './client'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'

async function getStats(ownerId: string) {
  const [caps, dels, nets] = await Promise.all([
    supabaseAdmin.from('capabilities').select('id', { count: 'exact' }).eq('owner_id', ownerId).eq('is_active', true),
    supabaseAdmin.from('delegations').select('id', { count: 'exact' }).eq('status', 'active'),
    supabaseAdmin.from('networks').select('id', { count: 'exact' }).eq('owner_id', ownerId),
  ])
  return {
    capabilities: caps.count ?? 0,
    delegations: dels.count ?? 0,
    networks: nets.count ?? 0,
  }
}

async function getRecentEvents() {
  const { data } = await supabaseAdmin
    .from('relay_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)
  return data ?? []
}

async function hasApiKey(ownerId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('api_keys')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()
  return !!data
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [stats, events, hasKey] = await Promise.all([
    getStats(user.id),
    getRecentEvents(),
    hasApiKey(user.id),
  ])

  return (
    <DashboardLayout>
      <DashboardClient
        stats={stats}
        events={events}
        showOnboarding={!hasKey}
      />
    </DashboardLayout>
  )
}
