'use client'

import DashboardLayout from '@/components/DashboardLayout'
import InfoTip from '@/components/InfoTip'
import { useState, useEffect, useCallback } from 'react'

interface Network {
  id: string
  name: string
  description: string | null
  is_public: boolean
  invite_code: string
  member_count: number
  created_at: string
}

interface Member {
  id: string
  agent_did: string
  role: string
  joined_at: string
}

export default function NetworksPage() {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Network | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [copied, setCopied] = useState(false)

  const [createForm, setCreateForm] = useState({ name: '', description: '', is_public: false })
  const [joinCode, setJoinCode] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('relay_api_key') ?? ''
    setApiKey(saved)
  }, [])

  const fetchNetworks = useCallback(async () => {
    if (!apiKey) return
    setLoading(true)
    const res = await fetch('/api/v1/networks', { headers: { Authorization: `Bearer ${apiKey}` } })
    const json = await res.json() as { data?: { networks: Network[] } }
    setNetworks(json.data?.networks ?? [])
    setLoading(false)
  }, [apiKey])

  useEffect(() => { fetchNetworks() }, [fetchNetworks])

  async function fetchMembers(networkId: string) {
    setLoadingMembers(true)
    const res = await fetch(`/api/v1/networks/${networkId}/members`, { headers: { Authorization: `Bearer ${apiKey}` } })
    const json = await res.json() as { data?: { members: Member[] } }
    setMembers(json.data?.members ?? [])
    setLoadingMembers(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/v1/networks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(createForm),
    })
    const json = await res.json() as { success: boolean; error?: string }
    if (!res.ok) {
      setError(json.error ?? 'Failed to create network')
    } else {
      setShowCreate(false)
      setCreateForm({ name: '', description: '', is_public: false })
      fetchNetworks()
    }
    setSubmitting(false)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    // Networks require a network ID to join — this is simplified to show join by invite code
    setError('To join a network, use the SDK: relay.networks.join({ inviteCode }) — or ask the network admin for the network ID.')
    setSubmitting(false)
  }

  function copyInvite(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '40px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#ededed', margin: 0 }}>Networks</h1>
              <InfoTip text="A network is a private group of agents that can discover and communicate with each other. Public networks are open to any verified agent. Private networks require an invite code to join." />
            </div>
            <p style={{ fontSize: '13px', color: '#6b6b66' }}>Private agent networks for controlled discovery and communication.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false) }} style={{
              background: '#111', color: '#ededed', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px', padding: '9px 18px', fontSize: '13px', fontFamily: 'monospace', cursor: 'pointer',
            }}>
              Join Network
            </button>
            <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false) }} style={{
              background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
              padding: '9px 18px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer',
            }}>
              {showCreate ? '✕ Cancel' : '+ Create'}
            </button>
          </div>
        </div>

        {/* API Key */}
        <div style={{
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px', padding: '16px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', flexShrink: 0 }}>API KEY</span>
          <input type="password" placeholder="kr_..." value={apiKey}
            onChange={e => { setApiKey(e.target.value); localStorage.setItem('relay_api_key', e.target.value) }}
            style={{ flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '8px 12px', color: '#ededed', fontFamily: 'monospace', fontSize: '13px', outline: 'none' }}
          />
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        {/* Create form */}
        {showCreate && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', marginBottom: '20px' }}>Create Network</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Name</label>
                <input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="My Agent Network"
                  style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '9px 12px', color: '#ededed', fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Description</label>
                <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this network for?" rows={2}
                  style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '9px 12px', color: '#ededed', fontFamily: 'monospace', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button type="submit" disabled={submitting} style={{ background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px', padding: '10px 24px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }}>
                  {submitting ? 'Creating…' : 'Create Network'}
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#6b6b66' }}>
                  <input type="checkbox" checked={createForm.is_public} onChange={e => setCreateForm(f => ({ ...f, is_public: e.target.checked }))} />
                  Public network (any verified agent can join)
                </label>
              </div>
            </form>
          </div>
        )}

        {/* Join form */}
        {showJoin && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#ededed', marginBottom: '20px' }}>Join Network</h2>
            <form onSubmit={handleJoin} style={{ display: 'flex', gap: '12px' }}>
              <input value={joinCode} onChange={e => setJoinCode(e.target.value)} placeholder="Invite code"
                style={{ flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '9px 12px', color: '#ededed', fontFamily: 'monospace', fontSize: '13px', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px', padding: '9px 20px', fontSize: '13px', fontFamily: 'monospace', fontWeight: 600, cursor: 'pointer' }}>
                Join
              </button>
            </form>
          </div>
        )}

        {/* Networks + members layout */}
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: '16px' }}>

          {/* Networks list */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>Your Networks</span>
            </div>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>Loading…</div>
            ) : networks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>No networks yet. Create one to get started.</div>
            ) : networks.map(net => (
              <div key={net.id} onClick={() => { setSelected(selected?.id === net.id ? null : net); fetchMembers(net.id) }}
                style={{
                  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                  background: selected?.id === net.id ? 'rgba(201,168,76,0.04)' : 'transparent',
                  borderLeft: selected?.id === net.id ? '2px solid #c9a84c' : '2px solid transparent',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#ededed' }}>{net.name}</span>
                  <span style={{
                    fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px',
                    background: net.is_public ? 'rgba(34,197,94,0.1)' : 'rgba(107,107,102,0.1)',
                    color: net.is_public ? '#22c55e' : '#6b6b66',
                    border: `1px solid ${net.is_public ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  }}>{net.is_public ? 'public' : 'private'}</span>
                </div>
                {net.description && <div style={{ fontSize: '12px', color: '#6b6b66', marginBottom: '6px' }}>{net.description}</div>}
                <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace' }}>{net.member_count} members · {new Date(net.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Members panel */}
          {selected && (
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', alignSelf: 'start' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#ededed' }}>{selected.name}</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6b6b66', cursor: 'pointer' }}>✕</button>
              </div>

              {!selected.is_public && (
                <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', marginBottom: '2px' }}>INVITE CODE</div>
                    <div style={{ fontSize: '12px', color: '#c9a84c', fontFamily: 'monospace' }}>{selected.invite_code}</div>
                  </div>
                  <button onClick={() => copyInvite(selected.invite_code)} style={{
                    background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(201,168,76,0.1)',
                    border: `1px solid ${copied ? 'rgba(34,197,94,0.2)' : 'rgba(201,168,76,0.2)'}`,
                    color: copied ? '#22c55e' : '#c9a84c',
                    borderRadius: '6px', padding: '5px 12px', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer',
                  }}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              )}

              <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace' }}>{members.length} members</span>
              </div>

              {loadingMembers ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>Loading…</div>
              ) : members.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#6b6b66', fontSize: '13px' }}>No members yet.</div>
              ) : members.map(m => (
                <div key={m.id} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#ededed' }}>{m.agent_did.slice(0, 30)}…</span>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: m.role === 'admin' ? '#c9a84c' : '#6b6b66' }}>{m.role}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace' }}>joined {new Date(m.joined_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
