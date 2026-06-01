'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback } from 'react'

interface Capability {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  agent_did: string
  auth_method: string
  price_per_call: number
  call_count: number
  avg_latency_ms: number | null
}

interface CategoryCount { category: string; count: number }

const categoryColor: Record<string, string> = {
  communication: '#3b82f6', research: '#a78bfa', code: '#22c55e',
  data: '#f59e0b', media: '#ec4899', other: '#6b6b66',
}

export default function RegistryPage() {
  const [capabilities, setCapabilities] = useState<Capability[]>([])
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '60' })
    if (query) params.set('query', query)
    if (category !== 'all') params.set('category', category)

    const [regRes, catRes] = await Promise.all([
      fetch(`/api/v1/registry?${params}`),
      fetch('/api/v1/registry/categories'),
    ])
    const [regJson, catJson] = await Promise.all([
      regRes.json() as Promise<{ data?: { capabilities: Capability[]; total: number } }>,
      catRes.json() as Promise<{ data?: { categories: CategoryCount[] } }>,
    ])
    setCapabilities(regJson.data?.capabilities ?? [])
    setTotal(regJson.data?.total ?? 0)
    setCategories(catJson.data?.categories ?? [])
    setLoading(false)
  }, [query, category])

  useEffect(() => {
    const t = setTimeout(fetchData, 300)
    return () => clearTimeout(t)
  }, [fetchData])

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#ededed' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '48px 48px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Image src="/KairosLogo.png" alt="KairosAI" width={28} height={28} style={{ borderRadius: '7px' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b6b66', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              KairosAI <span style={{ color: '#c9a84c' }}>Relay</span>
            </span>
          </a>
          <a href="/dashboard" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#080808', background: '#c9a84c', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
            Dashboard →
          </a>
        </nav>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Public Registry</div>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#ededed', marginBottom: '10px' }}>Capability Registry</h1>
            <p style={{ fontSize: '14px', color: '#6b6b66' }}>Browse all public capabilities registered by verified agents in the Relay network.</p>
          </div>

          {/* Category pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[{ category: 'all', count: total }, ...categories].map(({ category: cat, count }) => (
              <button key={cat} onClick={() => setCategory(cat)} style={{
                background: category === cat ? '#c9a84c' : '#0d0d0d',
                color: category === cat ? '#080808' : '#6b6b66',
                border: `1px solid ${category === cat ? '#c9a84c' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '100px', padding: '6px 14px', fontSize: '12px',
                fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                {cat === 'all' ? 'All' : cat} <span style={{ opacity: 0.7 }}>({count})</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search capabilities…"
            style={{
              width: '100%', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px', padding: '12px 18px', color: '#ededed', fontSize: '14px',
              outline: 'none', marginBottom: '24px', boxSizing: 'border-box',
            }}
          />

          <div style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', marginBottom: '20px' }}>
            {loading ? 'Loading…' : `${total} capabilities`}
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {capabilities.map(cap => (
              <div key={cap.id} style={{
                background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px', padding: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#ededed' }}>{cap.name}</div>
                  {cap.category && (
                    <span style={{
                      fontSize: '10px', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '100px', flexShrink: 0, marginLeft: '8px',
                      background: `${categoryColor[cap.category] ?? '#6b6b66'}20`,
                      color: categoryColor[cap.category] ?? '#6b6b66',
                      border: `1px solid ${categoryColor[cap.category] ?? '#6b6b66'}40`,
                    }}>{cap.category}</span>
                  )}
                </div>
                {cap.description && <div style={{ fontSize: '13px', color: '#6b6b66', lineHeight: 1.5, marginBottom: '14px' }}>{cap.description}</div>}
                <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', marginBottom: '12px' }}>
                  {cap.agent_did.slice(0, 36)}…
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace' }}>{cap.call_count} calls</span>
                    {cap.avg_latency_ms && <span style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace' }}>{cap.avg_latency_ms}ms</span>}
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: cap.price_per_call === 0 ? '#22c55e' : '#c9a84c' }}>
                    {cap.price_per_call === 0 ? 'free' : `$${(cap.price_per_call / 100).toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!loading && capabilities.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b6b66', fontSize: '14px' }}>
              No capabilities found.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
