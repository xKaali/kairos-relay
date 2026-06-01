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
  is_public: boolean
  price_per_call: number
  call_count: number
  is_active: boolean
  created_at: string
}

const CATEGORIES = ['communication', 'research', 'code', 'data', 'media', 'other']

const categoryColor: Record<string, string> = {
  communication: '#3b82f6',
  research: '#a78bfa',
  code: '#22c55e',
  data: '#f59e0b',
  media: '#ec4899',
  other: '#6b6b66',
}

export default function CapabilitiesPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    agent_did: '',
    name: '',
    slug: '',
    description: '',
    category: 'code',
    endpoint: '',
    auth_method: 'none',
    is_public: true,
    price_per_call: 0,
  })

  const supabase = createClient()

  const fetchCapabilities = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch('/api/v1/capabilities/discover?limit=50', {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    })
    const json = await res.json() as { data?: { capabilities: Capability[] } }
    setCapabilities(json.data?.capabilities ?? [])
    setLoading(false)
  }, [supabase.auth, apiKey])

  useEffect(() => {
    // load saved api key
    const saved = localStorage.getItem('relay_api_key') ?? ''
    setApiKey(saved)
  }, [])

  useEffect(() => {
    fetchCapabilities()
  }, [fetchCapabilities])

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!apiKey) {
      setError('Enter your API key above first.')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/v1/capabilities/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(form),
    })
    const json = await res.json() as { success: boolean; error?: string }

    if (!res.ok) {
      setError(json.error ?? 'Registration failed')
    } else {
      setSuccess('Capability registered.')
      setShowForm(false)
      setForm({ agent_did: '', name: '', slug: '', description: '', category: 'code', endpoint: '', auth_method: 'none', is_public: true, price_per_call: 0 })
      fetchCapabilities()
    }
    setSubmitting(false)
  }

  async function deactivate(id: string) {
    if (!apiKey) return alert('Enter your API key first.')
    const res = await fetch(`/api/v1/capabilities/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.ok) fetchCapabilities()
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ededed', margin: 0 }}>Capabilities</h1>
              <InfoTip text="A capability is a declared skill your AI agent can perform — like 'summarize emails' or 'search the web'. Other agents discover and call your capabilities through the Relay network." />
            </div>
            <p style={{ fontSize: '13px', color: '#6b6b66' }}>Register and manage what your agents can do.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
            padding: '9px 18px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer',
          }}>
            {showForm ? '✕ Cancel' : '+ Register'}
          </button>
        </div>

        {/* API Key input */}
        <div style={{
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', flexShrink: 0 }}>API KEY</span>
          <InfoTip text="Your kr_ API key authenticates all Relay API requests. Create one from the API Keys page if you don't have one yet." width={220} />
          <input
            type="password"
            placeholder="kr_..."
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); localStorage.setItem('relay_api_key', e.target.value) }}
            style={{
              flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px', padding: '8px 12px', color: '#ededed',
              fontFamily: 'monospace', fontSize: '13px', outline: 'none',
            }}
          />
        </div>

        {/* Register form */}
        {showForm && (
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '10px', padding: '24px', marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', marginBottom: '20px' }}>Register Capability</h2>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Agent DID', key: 'agent_did', placeholder: 'did:kairos:abc123' },
                  { label: 'Name', key: 'name', placeholder: 'Summarize emails' },
                  { label: 'Slug', key: 'slug', placeholder: 'summarize-emails' },
                  { label: 'Endpoint', key: 'endpoint', placeholder: 'https://agent.example.com/...' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</label>
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={e => {
                        const val = e.target.value
                        setForm(f => ({
                          ...f,
                          [key]: val,
                          ...(key === 'name' ? { slug: autoSlug(val) } : {}),
                        }))
                      }}
                      placeholder={placeholder}
                      style={{
                        width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                        fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{
                      width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                      fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Auth Method</label>
                  <select
                    value={form.auth_method}
                    onChange={e => setForm(f => ({ ...f, auth_method: e.target.value }))}
                    style={{
                      width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                      fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    }}
                  >
                    {['none', 'bearer', 'api_key'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does this capability do?"
                  rows={3}
                  style={{
                    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                    fontFamily: 'monospace', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="submit" disabled={submitting} style={{
                  background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
                  padding: '10px 24px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? 'Registering…' : 'Register'}
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b6b66' }}>
                  <input type="checkbox" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} />
                  Public capability
                </label>
              </div>
            </form>
          </div>
        )}

        {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#22c55e', fontSize: '13px', marginBottom: '16px' }}>{success}</div>}

        {/* Capabilities table */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>Registered Capabilities</span>
            <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace' }}>{capabilities.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>Loading…</div>
          ) : capabilities.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>
              No capabilities registered yet.
            </div>
          ) : (
            capabilities.map((cap) => (
              <div key={cap.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#ededed' }}>{cap.name}</span>
                    {cap.category && (
                      <span style={{
                        fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px',
                        background: `${categoryColor[cap.category]}20`, color: categoryColor[cap.category],
                        border: `1px solid ${categoryColor[cap.category]}40`,
                      }}>{cap.category}</span>
                    )}
                    {!cap.is_public && (
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', color: '#6b6b66', border: '1px solid rgba(255,255,255,0.08)' }}>private</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace' }}>
                    {cap.agent_did.slice(0, 40)}… · {cap.call_count} calls
                  </div>
                </div>
                <button
                  onClick={() => deactivate(cap.id)}
                  style={{
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    color: '#ef4444', borderRadius: '6px', padding: '6px 14px',
                    fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer',
                  }}
                >
                  Deactivate
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
