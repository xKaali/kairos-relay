'use client'

import DashboardLayout from '@/components/DashboardLayout'
import InfoTip from '@/components/InfoTip'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used: string | null
  is_active: boolean
  created_at: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const supabase = createClient()

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/v1/api-keys', {
      headers: { 'x-user-id': user.id },
    })
    const json = await res.json() as { data?: { keys: ApiKey[] } }
    setKeys(json.data?.keys ?? [])
    setLoading(false)
  }, [supabase.auth])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  async function createKey(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError('')
    setNewKey(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setCreating(false); return }

    const res = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ name: name.trim() }),
    })
    const json = await res.json() as { success: boolean; error?: string; data?: { key: string } }
    if (!res.ok) {
      setError(json.error ?? 'Failed to create key')
    } else {
      setNewKey(json.data!.key)
      setName('')
      fetchKeys()
    }
    setCreating(false)
  }

  async function revokeKey(id: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch(`/api/v1/api-keys/${id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': user.id },
    })
    if (res.ok) fetchKeys()
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ededed', margin: 0 }}>API Keys</h1>
            <InfoTip text="API keys authenticate your requests to the Relay API. Each key uses a kr_ prefix. Keys are hashed before storage — the raw key is only shown once at creation. Revoke any key instantly if it's compromised." />
          </div>
          <p style={{ fontSize: '13px', color: '#6b6b66' }}>Manage your <span style={{ fontFamily: 'monospace', color: '#c9a84c' }}>kr_</span> prefixed keys for authenticating Relay API requests.</p>
        </div>

        {/* New key display */}
        {newKey && (
          <div style={{
            background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '10px', padding: '20px', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '13px', color: '#22c55e', marginBottom: '10px', fontWeight: 600 }}>
              ✓ API key created — copy it now. You won't see it again.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <code style={{
                flex: 1, background: '#0a0a0a', borderRadius: '6px', padding: '10px 14px',
                fontFamily: 'monospace', fontSize: '13px', color: '#ededed',
                wordBreak: 'break-all', display: 'block',
              }}>{newKey}</code>
              <button onClick={() => copy(newKey)} style={{
                background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(201,168,76,0.1)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.3)'}`,
                color: copied ? '#22c55e' : '#c9a84c',
                borderRadius: '6px', padding: '8px 16px', fontSize: '12px',
                fontFamily: 'monospace', cursor: 'pointer', flexShrink: 0,
              }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Create form */}
        <div style={{
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px', padding: '24px', marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', marginBottom: '16px' }}>Create API Key</h2>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}
          <form onSubmit={createKey} style={{ display: 'flex', gap: '10px' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Key name (e.g. production, dev)"
              style={{
                flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px', padding: '9px 14px', color: '#ededed',
                fontFamily: 'monospace', fontSize: '13px', outline: 'none',
              }}
            />
            <button type="submit" disabled={creating || !name.trim()} style={{
              background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
              padding: '9px 20px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600,
              cursor: creating ? 'not-allowed' : 'pointer', opacity: creating || !name.trim() ? 0.6 : 1,
              flexShrink: 0,
            }}>
              {creating ? 'Creating…' : 'Create Key'}
            </button>
          </form>
        </div>

        {/* Keys table */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>Active Keys</span>
            <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace' }}>{keys.filter(k => k.is_active).length} active</span>
          </div>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 160px 160px 80px',
            padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Name / Key</span>
            <span>Last Used</span>
            <span>Created</span>
            <span></span>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>Loading…</div>
          ) : keys.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>No API keys yet.</div>
          ) : keys.map(key => (
            <div key={key.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 160px 160px 80px',
              padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: '13px', color: '#ededed', marginBottom: '3px', fontWeight: 500 }}>{key.name}</div>
                <code style={{ fontSize: '11px', color: '#c9a84c', fontFamily: 'monospace' }}>{key.key_prefix}••••••••</code>
              </div>
              <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace' }}>
                {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}
              </span>
              <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace' }}>
                {new Date(key.created_at).toLocaleDateString()}
              </span>
              <div style={{ textAlign: 'right' }}>
                <button onClick={() => revokeKey(key.id)} style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', borderRadius: '6px', padding: '5px 12px',
                  fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer',
                }}>
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Usage note */}
        <div style={{
          marginTop: '20px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px', padding: '20px',
        }}>
          <div style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage</div>
          <code style={{ fontSize: '12px', color: '#ededed', fontFamily: 'monospace', display: 'block', lineHeight: 1.7 }}>
            Authorization: Bearer kr_your_key_here
          </code>
        </div>
      </div>
    </DashboardLayout>
  )
}
