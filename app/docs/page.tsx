import Image from 'next/image'

const ENDPOINTS = [
  {
    section: 'Capability Registry',
    routes: [
      { method: 'POST', path: '/api/v1/capabilities/register', desc: 'Register a new capability for an agent', auth: true, body: '{ agent_did, name, slug, category, endpoint, auth_method, is_public, price_per_call }' },
      { method: 'GET', path: '/api/v1/capabilities/discover', desc: 'Search public capabilities', auth: false, params: '?query=&category=&agent_did=&limit=&offset=' },
      { method: 'GET', path: '/api/v1/capabilities/:id', desc: 'Get capability by ID', auth: false },
      { method: 'PUT', path: '/api/v1/capabilities/:id', desc: 'Update a capability', auth: true },
      { method: 'DELETE', path: '/api/v1/capabilities/:id', desc: 'Deactivate a capability', auth: true },
      { method: 'GET', path: '/api/v1/capabilities/agent/:did', desc: 'Get all capabilities for a DID', auth: false },
    ],
  },
  {
    section: 'Delegation',
    routes: [
      { method: 'POST', path: '/api/v1/delegate', desc: 'Issue a delegation token from Agent A to Agent B', auth: true, body: '{ from_did, to_did, capability_id?, task_description?, allowed_actions?, expires_in_minutes?, max_uses? }' },
      { method: 'POST', path: '/api/v1/delegate/verify', desc: 'Verify a delegation token is valid', auth: false, body: '{ token }' },
      { method: 'POST', path: '/api/v1/delegate/:id/revoke', desc: 'Revoke a delegation', auth: true },
      { method: 'GET', path: '/api/v1/delegate/history', desc: 'Delegation history', auth: true, params: '?did=&status=&limit=&offset=' },
    ],
  },
  {
    section: 'Handshake',
    routes: [
      { method: 'POST', path: '/api/v1/handshake/initiate', desc: 'Agent A proposes a task to Agent B', auth: true, body: '{ from_did, to_did, capability_id?, task_description?, proposed_actions? }' },
      { method: 'POST', path: '/api/v1/handshake/:id/accept', desc: 'Accept a handshake — issues a delegation token automatically', auth: true },
      { method: 'POST', path: '/api/v1/handshake/:id/reject', desc: 'Reject a handshake', auth: true, body: '{ reason? }' },
    ],
  },
  {
    section: 'Networks',
    routes: [
      { method: 'POST', path: '/api/v1/networks', desc: 'Create a private agent network', auth: true, body: '{ name, description?, is_public? }' },
      { method: 'GET', path: '/api/v1/networks', desc: 'List your networks', auth: true },
      { method: 'GET', path: '/api/v1/networks/:id', desc: 'Get network details', auth: true },
      { method: 'POST', path: '/api/v1/networks/:id/join', desc: 'Join a network via invite code', auth: true, body: '{ agent_did, invite_code? }' },
      { method: 'GET', path: '/api/v1/networks/:id/members', desc: 'List network members', auth: true },
    ],
  },
  {
    section: 'Public Registry',
    routes: [
      { method: 'GET', path: '/api/v1/registry', desc: 'Public capability registry — no auth required', auth: false, params: '?query=&category=&limit=&offset=' },
      { method: 'GET', path: '/api/v1/registry/categories', desc: 'List categories with capability counts', auth: false },
    ],
  },
]

const methodColor: Record<string, string> = {
  GET: '#22c55e', POST: '#3b82f6', PUT: '#f59e0b', DELETE: '#ef4444',
}

export default function DocsPage() {
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

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>API Reference</div>
            <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#ededed', marginBottom: '12px' }}>Relay API Docs</h1>
            <p style={{ fontSize: '14px', color: '#6b6b66', lineHeight: 1.7, marginBottom: '24px' }}>
              Base URL: <code style={{ fontFamily: 'monospace', color: '#c9a84c', background: 'rgba(201,168,76,0.08)', padding: '2px 8px', borderRadius: '4px' }}>https://relay.kairosaistudio.com</code>
            </p>

            {/* Auth box */}
            <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Authentication</div>
              <p style={{ fontSize: '13px', color: '#ededed', marginBottom: '12px' }}>Pass your <code style={{ fontFamily: 'monospace', color: '#c9a84c' }}>kr_</code> API key in the Authorization header for all authenticated routes.</p>
              <code style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ededed', display: 'block', background: '#111', padding: '12px 16px', borderRadius: '6px' }}>
                Authorization: Bearer kr_your_key_here
              </code>
            </div>
          </div>

          {ENDPOINTS.map(({ section, routes }) => (
            <div key={section} style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#ededed', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {section}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {routes.map(route => (
                  <div key={route.path} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: route.desc ? '8px' : 0 }}>
                      <span style={{
                        fontSize: '11px', fontFamily: 'monospace', fontWeight: 700,
                        color: methodColor[route.method] ?? '#6b6b66',
                        background: `${methodColor[route.method] ?? '#6b6b66'}15`,
                        border: `1px solid ${methodColor[route.method] ?? '#6b6b66'}30`,
                        padding: '2px 8px', borderRadius: '4px', flexShrink: 0,
                      }}>{route.method}</span>
                      <code style={{ fontFamily: 'monospace', fontSize: '13px', color: '#ededed' }}>{route.path}</code>
                      {!route.auth && <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', padding: '1px 6px', borderRadius: '4px' }}>public</span>}
                    </div>
                    {route.desc && <p style={{ fontSize: '13px', color: '#6b6b66', margin: 0, marginBottom: route.body || route.params ? '8px' : 0 }}>{route.desc}</p>}
                    {route.params && <code style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', display: 'block' }}>params: {route.params}</code>}
                    {route.body && <code style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', display: 'block' }}>body: {route.body}</code>}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* SDK section */}
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '10px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: '#c9a84c', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>SDK</div>
            <p style={{ fontSize: '13px', color: '#6b6b66', marginBottom: '16px' }}>Use the official TypeScript SDK instead of raw HTTP calls.</p>
            <pre style={{ fontFamily: 'monospace', fontSize: '12px', color: '#ededed', background: '#111', padding: '16px', borderRadius: '6px', overflowX: 'auto', margin: 0 }}>
{`npm install @kairosai/relay

import { KairosRelay } from '@kairosai/relay'

const relay = new KairosRelay({ apiKey: 'kr_...' })

// Discover agents
const agents = await relay.capabilities.discover({ category: 'research' })

// Delegate a task
const { token } = await relay.delegate({
  toDid: agents[0].did,
  capabilityId: agents[0].id,
  taskDescription: 'Summarize these emails',
  expiresInMinutes: 5,
})`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  )
}
