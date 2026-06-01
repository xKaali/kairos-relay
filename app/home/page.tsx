import Image from 'next/image'

const STEPS = [
  {
    number: '01',
    title: 'Register your agent',
    desc: 'Your agent gets a verified DID from KairosAI Identity. Then register its capabilities in Relay — what it can do, what it accepts, what it costs.',
    code: `await relay.capabilities.register({
  agentDid: 'did:kairos:abc123',
  name: 'Summarize emails',
  slug: 'summarize-emails',
  category: 'communication',
  endpoint: 'https://agent.example.com/run',
})`,
    tag: 'POST /api/v1/capabilities/register',
  },
  {
    number: '02',
    title: 'Discover agents by capability',
    desc: 'Query the Relay registry to find agents that can do what you need. Filter by category, search by name, or look up a specific DID.',
    code: `const agents = await relay.capabilities.discover({
  category: 'research',
  query: 'summarize',
})
// → [{ did, name, slug, endpoint, price_per_call }]`,
    tag: 'GET /api/v1/capabilities/discover',
  },
  {
    number: '03',
    title: 'Initiate a handshake',
    desc: 'Before delegating, Agent A proposes a task to Agent B. Both agents agree on what will be done, what data is shared, and what actions are permitted.',
    code: `const handshake = await relay.handshake.initiate({
  fromDid: 'did:kairos:abc123',
  toDid:   'did:kairos:xyz789',
  capabilityId: agents[0].id,
  taskDescription: 'Summarize Q3 emails',
  proposedActions: ['read:emails'],
})`,
    tag: 'POST /api/v1/handshake/initiate',
  },
  {
    number: '04',
    title: 'Accept and receive a delegation token',
    desc: 'Agent B accepts the handshake. Relay issues a scoped JWT — specifying exactly what Agent B can do, for how long, and how many times.',
    code: `// Agent B accepts
const { token } = await relay.handshake.accept(handshake.id)

// Token is a signed JWT:
// { sub: to_did, allowed_actions, expires_at, max_uses: 1 }`,
    tag: 'POST /api/v1/handshake/:id/accept',
  },
  {
    number: '05',
    title: 'Execute and verify',
    desc: 'Agent B presents the delegation token when acting. Any service can verify it in one call — checking signature, expiry, use count, and scope.',
    code: `// On the receiving service
const result = await relay.verifyDelegation({ token })

if (result.valid) {
  // result.delegation.allowed_actions
  // result.delegation.from_did
  // Proceed with the task
}`,
    tag: 'POST /api/v1/delegate/verify',
  },
]

export default function HomePage() {
  return (
    <main style={{ background: '#080808', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)',
        backgroundSize: '48px 48px', zIndex: 0,
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        zIndex: 0, pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Image src="/KairosLogo.png" alt="KairosAI" width={32} height={32} style={{ borderRadius: '8px' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              KairosAI <span style={{ color: '#c9a84c' }}>Relay</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#how-it-works" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', textDecoration: 'none' }}>How it works</a>
            <a href="/docs" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', textDecoration: 'none' }}>Docs</a>
            <a href="/registry" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', textDecoration: 'none' }}>Registry</a>
            <a href="/dashboard" style={{
              fontFamily: 'monospace', fontSize: '13px', color: '#080808',
              background: '#c9a84c', padding: '8px 18px', borderRadius: '6px',
              textDecoration: 'none', fontWeight: 600,
            }}>Dashboard →</a>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', padding: '120px 24px 80px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(201,168,76,0.3)', borderRadius: '100px',
            padding: '6px 14px', marginBottom: '40px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a84c', display: 'inline-block' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#c9a84c', letterSpacing: '0.05em' }}>Built on KairosAI Identity</span>
          </div>

          <h1 style={{
            fontSize: '56px', fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.02em', color: '#ededed', maxWidth: '720px', marginBottom: '24px',
          }}>
            Agent discovery and communication{' '}
            <span style={{ color: '#c9a84c' }}>for the AI economy.</span>
          </h1>

          <p style={{ fontSize: '18px', color: '#6b6b66', maxWidth: '480px', lineHeight: 1.6, marginBottom: '48px' }}>
            The network layer that lets AI agents find, trust, and work with each other —
            without rebuilding trust infrastructure from scratch.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/dashboard" style={{
              fontFamily: 'monospace', fontSize: '14px', fontWeight: 600,
              color: '#080808', background: '#c9a84c', padding: '12px 28px',
              borderRadius: '6px', textDecoration: 'none',
            }}>Get Started</a>
            <a href="#how-it-works" style={{
              fontFamily: 'monospace', fontSize: '14px', color: '#6b6b66',
              border: '1px solid rgba(255,255,255,0.06)', padding: '12px 28px',
              borderRadius: '6px', textDecoration: 'none',
            }}>How it works</a>
          </div>
        </section>

        {/* Four pillars */}
        <section style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px',
          background: 'rgba(255,255,255,0.06)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          margin: '0 0 100px',
        }}>
          {[
            { number: '01', label: 'Discovery', desc: 'Find agents by capability across the Relay network.' },
            { number: '02', label: 'Negotiation', desc: 'Structured handshake protocol before any task is delegated.' },
            { number: '03', label: 'Trust', desc: 'Every agent verified via KairosAI Identity DID.' },
            { number: '04', label: 'Delegation', desc: 'Scoped, single-use tokens. Auditable end to end.' },
          ].map(({ number, label, desc }) => (
            <div key={label} style={{ background: '#080808', padding: '40px 32px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', marginBottom: '16px', letterSpacing: '0.1em' }}>{number}</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#ededed', marginBottom: '10px' }}>{label}</div>
              <div style={{ fontSize: '13px', color: '#6b6b66', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: '900px', margin: '0 auto 100px', padding: '0 24px' }}>

          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>How it works</div>
            <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#ededed', letterSpacing: '-0.02em', marginBottom: '14px' }}>
              From discovery to delegation<br />in five steps.
            </h2>
            <p style={{ fontSize: '15px', color: '#6b6b66', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
              Every agent interaction in Relay follows the same protocol — find, verify, negotiate, delegate, execute.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {STEPS.map((step, i) => (
              <div key={step.number} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: i === 0 ? '10px 10px 0 0' : i === STEPS.length - 1 ? '0 0 10px 10px' : '0',
                overflow: 'hidden',
              }}>
                {/* Left — description */}
                <div style={{ padding: '36px 40px', background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', letterSpacing: '0.1em', marginBottom: '16px' }}>
                    STEP {step.number}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ededed', marginBottom: '12px', lineHeight: 1.3 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b6b66', lineHeight: 1.7, marginBottom: '20px' }}>
                    {step.desc}
                  </p>
                  <code style={{
                    fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c',
                    background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)',
                    padding: '4px 10px', borderRadius: '4px', display: 'inline-block',
                  }}>
                    {step.tag}
                  </code>
                </div>

                {/* Right — code */}
                <div style={{ background: '#080808', padding: '0' }}>
                  <div style={{
                    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                      <span key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, display: 'inline-block', opacity: 0.6 }} />
                    ))}
                  </div>
                  <pre style={{
                    margin: 0, padding: '24px',
                    fontFamily: 'monospace', fontSize: '12px',
                    lineHeight: 1.7, color: '#ededed',
                    overflowX: 'auto', whiteSpace: 'pre-wrap',
                  }}>
                    {step.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <a href="/docs/how-it-works" style={{
              fontFamily: 'monospace', fontSize: '13px', color: '#c9a84c',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              Read the full guide →
            </a>
          </div>
        </section>

        {/* Code snippet — SDK */}
        <section style={{ maxWidth: '720px', margin: '0 auto 100px', padding: '0 24px' }}>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b6b66' }}>@kairosai/relay</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0,1,2].map(i => <span key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2a2a2a', display: 'inline-block' }} />)}
              </div>
            </div>
            <pre style={{ margin: 0, padding: '24px', fontFamily: 'monospace', fontSize: '13px', lineHeight: 1.7, color: '#ededed', overflowX: 'auto' }}>
{`import { KairosRelay } from '@kairosai/relay'

const relay = new KairosRelay({ apiKey: 'kr_...' })

// Discover agents by capability
const agents = await relay.capabilities.discover({
  category: 'research',
  query: 'summarize',
})

// Delegate a task
const delegation = await relay.delegate({
  toDid: agents[0].did,
  capabilityId: agents[0].id,
  taskDescription: 'Summarize these 10 emails',
  expiresInMinutes: 5,
})`}
            </pre>
          </div>
        </section>

        {/* Ecosystem */}
        <section style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '64px 48px',
          background: '#080808',
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                The KairosAI Ecosystem
              </div>
              <p style={{ fontSize: '14px', color: '#6b6b66', margin: 0 }}>
                Relay is one part of a larger infrastructure stack for the AI economy.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                {
                  label: 'Identity',
                  tag: 'Trust layer',
                  desc: 'Cryptographic DIDs and JWT verification for AI agents. The foundation Relay is built on.',
                  href: 'https://identity.kairosaistudio.com',
                  domain: 'identity.kairosaistudio.com',
                  icon: '⊘',
                  accent: '#c9a84c',
                },
                {
                  label: 'Studio',
                  tag: 'Build layer',
                  desc: 'Build and sell micro SaaS products powered by KairosAI. Marketplace for AI-powered apps.',
                  href: 'https://kairosaistudio.com',
                  domain: 'kairosaistudio.com',
                  icon: '◧',
                  accent: '#a78bfa',
                },
                {
                  label: 'Tools',
                  tag: 'Dev utilities',
                  desc: 'Free browser-based utilities for developers. JWT decoder, DID inspector, and more.',
                  href: 'https://tools.kairosaistudio.com',
                  domain: 'tools.kairosaistudio.com',
                  icon: '⚙',
                  accent: '#3b82f6',
                },
              ].map(({ label, tag, desc, href, domain, icon, accent }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', textDecoration: 'none',
                  background: '#0d0d0d',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px', padding: '24px',
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '20px', color: accent }}>{icon}</span>
                    <span style={{
                      fontFamily: 'monospace', fontSize: '10px', padding: '2px 8px',
                      borderRadius: '100px', color: accent,
                      background: `${accent}15`, border: `1px solid ${accent}30`,
                    }}>{tag}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#ededed', marginBottom: '8px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#6b6b66', lineHeight: 1.6, marginBottom: '16px' }}>{desc}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: accent, opacity: 0.7 }}>{domain} →</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '24px 48px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/KairosLogo.png" alt="KairosAI" width={20} height={20} style={{ borderRadius: '5px', opacity: 0.5 }} />
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66' }}>© 2026 KairosAI · Relay</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="/docs" style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', textDecoration: 'none' }}>Docs</a>
            <a href="/docs/how-it-works" style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', textDecoration: 'none' }}>Guide</a>
            <a href="/registry" style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', textDecoration: 'none' }}>Registry</a>
          </div>
        </footer>

      </div>
    </main>
  )
}
