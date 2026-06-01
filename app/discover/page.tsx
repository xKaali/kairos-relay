'use client'

import DashboardLayout from '@/components/DashboardLayout'
import InfoTip from '@/components/InfoTip'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Capability {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  agent_did: string
  endpoint: string | null
  auth_method: string
  price_per_call: number
  call_count: number
  avg_latency_ms: number | null
  created_at: string
}

const CATEGORIES = ['all', 'communication', 'research', 'code', 'data', 'media', 'other']

const categoryColor: Record<string, string> = {
  communication: '#3b82f6', research: '#a78bfa', code: '#22c55e',
  data: '#f59e0b', media: '#ec4899', other: '#6b6b66',
}

type HandshakeStep = 'idle' | 'form' | 'submitting' | 'success' | 'error'

export default function DiscoverPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<Capability | null>(null)
  const [apiKey, setApiKey] = useState('')

  // Handshake state
  const [hsStep, setHsStep] = useState<HandshakeStep>('idle')
  const [fromDid, setFromDid] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [actions, setActions] = useState('')
  const [hsError, setHsError] = useState('')
  const [hsResult, setHsResult] = useState<{ id: string } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const saved = localStorage.getItem('relay_api_key') ?? ''
    setApiKey(saved)
  }, [])

  const search = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '50' })
    if (query) params.set('query', query)
    if (category !== 'all') params.set('category', category)
    const res = await fetch(`/api/v1/capabilities/discover?${params}`)
    const json = await res.json() as { data?: { capabilities: Capability[]; total: number } }
    setCapabilities(json.data?.capabilities ?? [])
    setTotal(json.data?.total ?? 0)
    setLoading(false)
  }, [query, category])

  useEffect(() => {
    const t = setTimeout(search, 300)
    return () => clearTimeout(t)
  }, [search])

  function openHandshake(cap: Capability) {
    setSelected(cap)
    setHsStep('form')
    setHsError('')
    setHsResult(null)
    setTaskDesc('')
    setActions('')
  }

  function closePanel() {
    setSelected(null)
    setHsStep('idle')
  }

  async function submitHandshake(e: React.FormEvent) {
    e.preventDefault()
    if (!apiKey) { setHsError('Enter your API key on the Capabilities page first.'); return }
    if (!fromDid) { setHsError('Your agent DID is required.'); return }

    setHsStep('submitting')
    setHsError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setHsError('Not authenticated.'); setHsStep('form'); return }

    const res = await fetch('/api/v1/handshake/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from_did: fromDid,
        to_did: selected!.agent_did,
        capability_id: selected!.id,
        task_description: taskDesc || undefined,
        proposed_actions: actions ? actions.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      }),
    })

    const json = await res.json() as { success: boolean; error?: string; data?: { id: string } }

    if (!res.ok) {
      setHsError(json.error ?? 'Handshake failed')
      setHsStep('form')
    } else {
      setHsResult({ id: json.data!.id })
      setHsStep('success')
    }
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>

        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ededed', margin: 0 }}>Discover</h1>
            <InfoTip text="The capability registry is a searchable index of everything agents in the Relay network can do. Find an agent, inspect its capabilities, and initiate a handshake to start collaborating." />
          </div>
          <p style={{ fontSize: '13px', color: '#6b6b66' }}>Search the public capability registry across all verified agents.</p>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search capabilities…"
            style={{ flex: 1, background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 16px', color: '#ededed', fontSize: '14px', outline: 'none' }}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}
            style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 16px', color: '#ededed', fontFamily: 'monospace', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}
          </select>
        </div>

        <div style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', marginBottom: '16px' }}>
          {loading ? 'Searching…' : `${total} capabilities found`}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '16px' }}>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', alignContent: 'start' }}>
            {capabilities.map(cap => (
              <div key={cap.id} onClick={() => { setSelected(cap); setHsStep('idle') }}
                style={{
                  background: '#0d0d0d',
                  border: `1px solid ${selected?.id === cap.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '10px', padding: '18px', cursor: 'pointer', transition: 'border-color 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#ededed' }}>{cap.name}</div>
                  {cap.category && (
                    <span style={{
                      fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px', flexShrink: 0, marginLeft: '8px',
                      background: `${categoryColor[cap.category] ?? '#6b6b66'}20`,
                      color: categoryColor[cap.category] ?? '#6b6b66',
                      border: `1px solid ${categoryColor[cap.category] ?? '#6b6b66'}40`,
                    }}>{cap.category}</span>
                  )}
                </div>
                {cap.description && <div style={{ fontSize: '12px', color: '#6b6b66', lineHeight: 1.5, marginBottom: '12px' }}>{cap.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66' }}>{cap.call_count} calls</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: cap.price_per_call === 0 ? '#22c55e' : '#c9a84c' }}>
                    {cap.price_per_call === 0 ? 'free' : `$${(cap.price_per_call / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
            {!loading && capabilities.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>No capabilities found.</div>
            )}
          </div>

          {/* Detail + Handshake panel */}
          {selected && (
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', alignSelf: 'start', position: 'sticky', top: '24px' }}>

              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#ededed', marginBottom: '4px' }}>{selected.name}</div>
                  {selected.category && (
                    <span style={{
                      fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px',
                      background: `${categoryColor[selected.category] ?? '#6b6b66'}20`,
                      color: categoryColor[selected.category] ?? '#6b6b66',
                      border: `1px solid ${categoryColor[selected.category] ?? '#6b6b66'}40`,
                    }}>{selected.category}</span>
                  )}
                </div>
                <button onClick={closePanel} style={{ background: 'none', border: 'none', color: '#6b6b66', cursor: 'pointer', fontSize: '16px', padding: '0' }}>✕</button>
              </div>

              {/* Details */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {[
                  { label: 'Agent DID', value: selected.agent_did },
                  { label: 'Endpoint', value: selected.endpoint ?? '—' },
                  { label: 'Auth', value: selected.auth_method },
                  { label: 'Calls', value: selected.call_count.toString() },
                  { label: 'Price', value: selected.price_per_call === 0 ? 'Free' : `$${(selected.price_per_call / 100).toFixed(2)}/call` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
                    <span style={{ fontSize: '11px', color: '#ededed', fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'right', maxWidth: '200px' }}>{value}</span>
                  </div>
                ))}
                {selected.description && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', background: '#111', borderRadius: '6px', fontSize: '12px', color: '#6b6b66', lineHeight: 1.6 }}>
                    {selected.description}
                  </div>
                )}
              </div>

              {/* Handshake section */}
              <div style={{ padding: '20px 24px' }}>

                {hsStep === 'idle' && (
                  <button onClick={() => openHandshake(selected)} style={{
                    width: '100%', background: '#c9a84c', color: '#080808', border: 'none',
                    borderRadius: '6px', padding: '10px', fontSize: '13px',
                    fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer',
                  }}>
                    Initiate Handshake →
                  </button>
                )}

                {(hsStep === 'form' || hsStep === 'submitting') && (
                  <form onSubmit={submitHandshake}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#ededed', marginBottom: '14px' }}>
                      Initiate Handshake
                      <InfoTip text="A handshake is the negotiation step before delegating a task. You propose what you need done and what permissions you're requesting. The receiving agent then accepts or rejects. Acceptance automatically issues a scoped delegation token." width={260} />
                    </div>

                    {hsError && (
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '8px 12px', color: '#ef4444', fontSize: '12px', marginBottom: '12px' }}>
                        {hsError}
                      </div>
                    )}

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Your Agent DID</label>
                      <input value={fromDid} onChange={e => setFromDid(e.target.value)} placeholder="did:kairos:abc123" required
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 10px', color: '#ededed', fontFamily: 'monospace', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Task Description</label>
                      <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="What do you need this agent to do?" rows={2}
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 10px', color: '#ededed', fontFamily: 'monospace', fontSize: '12px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '10px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Proposed Actions <span style={{ color: '#6b6b66', textTransform: 'none' }}>(comma separated)</span></label>
                      <input value={actions} onChange={e => setActions(e.target.value)} placeholder="read:emails, write:summary"
                        style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 10px', color: '#ededed', fontFamily: 'monospace', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => setHsStep('idle')} style={{
                        flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px',
                        padding: '9px', fontSize: '12px', fontFamily: 'monospace', color: '#6b6b66', cursor: 'pointer',
                      }}>
                        Cancel
                      </button>
                      <button type="submit" disabled={hsStep === 'submitting'} style={{
                        flex: 2, background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
                        padding: '9px', fontSize: '12px', fontFamily: 'monospace', fontWeight: 600,
                        cursor: hsStep === 'submitting' ? 'not-allowed' : 'pointer',
                        opacity: hsStep === 'submitting' ? 0.7 : 1,
                      }}>
                        {hsStep === 'submitting' ? 'Initiating…' : 'Send Handshake'}
                      </button>
                    </div>
                  </form>
                )}

                {hsStep === 'success' && hsResult && (
                  <div>
                    <div style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
                      <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600, marginBottom: '8px' }}>✓ Handshake initiated</div>
                      <div style={{ fontSize: '11px', color: '#6b6b66', marginBottom: '8px' }}>Waiting for the agent to accept or reject. Expires in 10 minutes.</div>
                      <div style={{ fontSize: '10px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Handshake ID</div>
                      <code style={{ fontSize: '11px', color: '#ededed', fontFamily: 'monospace', wordBreak: 'break-all' }}>{hsResult.id}</code>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setHsStep('idle'); setHsResult(null) }} style={{
                        flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px',
                        padding: '9px', fontSize: '12px', fontFamily: 'monospace', color: '#6b6b66', cursor: 'pointer',
                      }}>
                        Done
                      </button>
                      <button onClick={() => openHandshake(selected)} style={{
                        flex: 1, background: 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '6px',
                        padding: '9px', fontSize: '12px', fontFamily: 'monospace', color: '#c9a84c', cursor: 'pointer',
                      }}>
                        New Handshake
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
