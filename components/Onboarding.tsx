'use client'

import { useState } from 'react'
import Onboarding from '@/components/Onboarding'

interface Stats {
  capabilities: number
  delegations: number
  networks: number
}

interface Event {
  id: string
  event_type: string
  from_did: string | null
  created_at: string
}

interface Props {
  stats: Stats
  events: Event[]
  showOnboarding: boolean
}

function eventColor(type: string) {
  if (type.includes('REGISTERED') || type.includes('ACCEPTED')) return '#22c55e'
  if (type.includes('REVOKED') || type.includes('REJECTED')) return '#ef4444'
  if (type.includes('ISSUED')) return '#3b82f6'
  return '#6b6b66'
}

function eventLabel(type: string) {
  return type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
}

export default function DashboardClient({ stats, events, showOnboarding }: Props) {
  const [onboarding, setOnboarding] = useState(showOnboarding)

  const statCards = [
    { label: 'Capabilities', value: stats.capabilities, desc: 'Registered & active', icon: '◈', color: '#c9a84c' },
    { label: 'Active Delegations', value: stats.delegations, desc: 'Currently in-flight', icon: '⇄', color: '#3b82f6' },
    { label: 'Networks', value: stats.networks, desc: 'Owned or joined', icon: '⬡', color: '#a78bfa' },
  ]

  return (
    <>
      {onboarding && <Onboarding onComplete={() => setOnboarding(false)} />}

      <div style={{ padding: '40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ededed', marginBottom: '6px' }}>Overview</h1>
          <p style={{ fontSize: '13px', color: '#6b6b66', fontFamily: 'monospace' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {statCards.map(({ label, value, desc, icon, color }) => (
            <div key={label} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: '18px', color }}>{icon}</span>
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#ededed', fontFamily: 'monospace', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '12px', color: '#6b6b66' }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
          {[
            { label: 'Register Capability', href: '/capabilities', desc: 'Add a new agent capability', icon: '◈' },
            { label: 'Discover Agents', href: '/discover', desc: 'Search the capability registry', icon: '⊙' },
            { label: 'Create Network', href: '/networks', desc: 'Set up a private agent network', icon: '⬡' },
          ].map(({ label, href, desc, icon }) => (
            <a key={label} href={href} style={{
              display: 'block', background: '#0d0d0d',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
              padding: '20px', textDecoration: 'none',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '10px' }}>{icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '12px', color: '#6b6b66' }}>{desc}</div>
            </a>
          ))}
        </div>

        {/* Recent events */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>Recent Activity</span>
          </div>
          {events.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: '#6b6b66', marginBottom: '12px' }}>No activity yet.</div>
              <a href="/capabilities" style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c9a84c', textDecoration: 'none' }}>
                Register your first capability →
              </a>
            </div>
          ) : events.map((event) => (
            <div key={event.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: eventColor(event.event_type), flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13px', color: '#ededed' }}>{eventLabel(event.event_type)}</div>
                  {event.from_did && (
                    <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', marginTop: '2px' }}>
                      {event.from_did.slice(0, 32)}…
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', flexShrink: 0 }}>
                {new Date(event.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
