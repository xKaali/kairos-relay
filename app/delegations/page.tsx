'use client'

import DashboardLayout from '@/components/DashboardLayout'
import InfoTip from '@/components/InfoTip'
import { useState, useEffect, useCallback } from 'react'

interface Delegation {
  id: string
  from_did: string
  to_did: string
  task_description: string | null
  allowed_actions: string[] | null
  max_uses: number
  use_count: number
  expires_at: string
  status: string
  created_at: string
}

const statusColor: Record<string, string> = {
  active: '#22c55e',
  pending: '#f59e0b',
  completed: '#6b6b66',
  expired: '#6b6b66',
  revoked: '#ef4444',
}

export default function DelegationsPage() {
  const [delegations, setDelegations] = useState<Delegation[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [issued, setIssued] = useState<{ token: string; id: string } | null>(null)

  const [form, setForm] = useState({
    from_did: '',
    to_did: '',
    capability_id: '',
    task_description: '',
    allowed_actions: '',
    expires_in_minutes: 10,
    max_uses: 1,
  })

  useEffect(() => {
    const saved = localStorage.getItem('relay_api_key') ?? ''
    setApiKey(saved)
  }, [])

  const fetchDelegations = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    const res = await fetch('/api/v1/delegate/history', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    const json = await res.json() as { data?: { delegations: Delegation[] } }
    setDelegations(json.data?.delegations ?? [])
    setLoading(false)
  }, [apiKey])

  useEffect(() => {
    fetchDelegations()
  }, [fetchDelegations])

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setIssued(null)

    const body = {
      from_did: form.from_did,
      to_did: form.to_did,
      capability_id: form.capability_id || undefined,
      task_description: form.task_description || undefined,
      allowed_actions: form.allowed_actions ? form.allowed_actions.split(',').map(s => s.trim()) : undefined,
      expires_in_minutes: form.expires_in_minutes,
      max_uses: form.max_uses,
    }

    const res = await fetch('/api/v1/delegate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })
    const json = await res.json() as { success: boolean; error?: string; data?: { token: string; delegation: { id: string } } }
    if (!res.ok) {
      setError(json.error ?? 'Failed to issue delegation')
    } else {
      setIssued({ token: json.data!.token, id: json.data!.delegation.id })
      setShowForm(false)
      fetchDelegations()
    }
    setSubmitting(false)
  }

  async function revoke(id: string) {
    if (!apiKey) return
    const res = await fetch(`/api/v1/delegate/${id}/revoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.ok) fetchDelegations()
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) < new Date()
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ededed', margin: 0 }}>Delegations</h1>
              <InfoTip text="A delegation token is a short-lived, scoped JWT that grants one agent permission to act on behalf of another — for a specific task, with a set number of uses and an expiry. Once used or expired, it's gone." />
            </div>
            <p style={{ fontSize: '13px', color: '#6b6b66' }}>Issue and manage scoped delegation tokens between agents.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
            padding: '9px 18px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer',
          }}>
            {showForm ? '✕ Cancel' : '+ Issue Token'}
          </button>
        </div>

        {/* API Key */}
        <div style={{
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', flexShrink: 0 }}>API KEY</span>
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

        {/* Issued token display */}
        {issued && (
          <div style={{
            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '10px', padding: '20px', marginBottom: '20px',
          }}>
            <div style={{ fontSize: '13px', color: '#22c55e', marginBottom: '10px', fontWeight: 600 }}>✓ Delegation token issued — copy now, it won't be shown again.</div>
            <div style={{
              background: '#0a0a0a', borderRadius: '6px', padding: '12px',
              fontFamily: 'monospace', fontSize: '11px', color: '#ededed',
              wordBreak: 'break-all', cursor: 'pointer',
            }} onClick={() => navigator.clipboard.writeText(issued.token)}>
              {issued.token}
            </div>
            <div style={{ fontSize: '11px', color: '#6b6b66', marginTop: '8px' }}>Click token to copy</div>
          </div>
        )}

        {/* Issue form */}
        {showForm && (
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: '10px', padding: '24px', marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', marginBottom: '20px' }}>Issue Delegation Token</h2>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleIssue}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'From DID', key: 'from_did', placeholder: 'did:kairos:abc123' },
                  { label: 'To DID', key: 'to_did', placeholder: 'did:kairos:xyz789' },
                  { label: 'Capability ID (optional)', key: 'capability_id', placeholder: 'uuid' },
                  { label: 'Allowed Actions (comma separated)', key: 'allowed_actions', placeholder: 'read:emails, write:summary' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</label>
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
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
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Expires (minutes)</label>
                  <input
                    type="number" min={1} max={60}
                    value={form.expires_in_minutes}
                    onChange={e => setForm(f => ({ ...f, expires_in_minutes: parseInt(e.target.value) || 10 }))}
                    style={{
                      width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                      fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Max Uses</label>
                  <input
                    type="number" min={1} max={100}
                    value={form.max_uses}
                    onChange={e => setForm(f => ({ ...f, max_uses: parseInt(e.target.value) || 1 }))}
                    style={{
                      width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                      fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Task Description</label>
                <textarea
                  value={form.task_description}
                  onChange={e => setForm(f => ({ ...f, task_description: e.target.value }))}
                  placeholder="Describe what the receiving agent should do…"
                  rows={2}
                  style={{
                    width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px', padding: '9px 12px', color: '#ededed',
                    fontFamily: 'monospace', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
              </div>

              <button type="submit" disabled={submitting} style={{
                marginTop: '20px', background: '#c9a84c', color: '#080808', border: 'none',
                borderRadius: '6px', padding: '10px 24px', fontSize: '13px',
                fontFamily: 'monospace', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.6 : 1,
              }}>
                {submitting ? 'Issuing…' : 'Issue Token'}
              </button>
            </form>
          </div>
        )}

        {/* Delegations table */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>Delegation History</span>
            <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace' }}>{delegations.length} total</span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>Loading…</div>
          ) : delegations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>No delegations yet.</div>
          ) : (
            delegations.map(del => {
              const expired = isExpired(del.expires_at)
              const effectiveStatus = expired && del.status === 'active' ? 'expired' : del.status
              return (
                <div key={del.id} style={{
                  padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                        background: statusColor[effectiveStatus] ?? '#6b6b66',
                      }} />
                      <span style={{ fontSize: '13px', color: '#ededed', fontWeight: 500 }}>
                        {del.task_description ?? 'Untitled delegation'}
                      </span>
                      <span style={{
                        fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px',
                        background: `${statusColor[effectiveStatus] ?? '#6b6b66'}20`,
                        color: statusColor[effectiveStatus] ?? '#6b6b66',
                        border: `1px solid ${statusColor[effectiveStatus] ?? '#6b6b66'}40`,
                      }}>{effectiveStatus}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace' }}>
                      {del.from_did.slice(0, 28)}… → {del.to_did.slice(0, 28)}… · {del.use_count}/{del.max_uses} uses · expires {new Date(del.expires_at).toLocaleString()}
                    </div>
                  </div>
                  {effectiveStatus === 'active' && (
                    <button onClick={() => revoke(del.id)} style={{
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#ef4444', borderRadius: '6px', padding: '6px 14px',
                      fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', flexShrink: 0,
                    }}>
                      Revoke
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
