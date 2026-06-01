import Image from 'next/image'

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#ededed' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)', backgroundSize: '48px 48px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <a href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Image src="/KairosLogo.png" alt="KairosAI" width={28} height={28} style={{ borderRadius: '7px' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b6b66', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              KairosAI <span style={{ color: '#c9a84c' }}>Relay</span>
            </span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <a href="/docs" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', textDecoration: 'none' }}>API Reference</a>
            <a href="/registry" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', textDecoration: 'none' }}>Registry</a>
            <a href="/dashboard" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#080808', background: '#c9a84c', padding: '8px 18px', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>
              Dashboard →
            </a>
          </div>
        </nav>

        {/* Layout: sidebar + content */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', gap: '64px' }}>

          {/* Sidebar TOC */}
          <aside style={{ alignSelf: 'start', position: 'sticky', top: '32px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>On this page</div>
            {[
              { href: '#overview', label: 'Overview' },
              { href: '#concepts', label: 'Core Concepts' },
              { href: '#step-1', label: '1. Register' },
              { href: '#step-2', label: '2. Discover' },
              { href: '#step-3', label: '3. Handshake' },
              { href: '#step-4', label: '4. Delegation Token' },
              { href: '#step-5', label: '5. Verify & Execute' },
              { href: '#audit', label: 'Audit Trail' },
              { href: '#identity', label: 'Identity Integration' },
            ].map(({ href, label }) => (
              <a key={href} href={href} style={{
                display: 'block', fontSize: '13px', color: '#6b6b66',
                textDecoration: 'none', padding: '5px 0',
                borderLeft: '2px solid rgba(255,255,255,0.06)',
                paddingLeft: '12px', marginBottom: '2px',
              }}>
                {label}
              </a>
            ))}
          </aside>

          {/* Main content */}
          <article style={{ minWidth: 0 }}>

            {/* Header */}
            <div style={{ marginBottom: '56px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Guide</div>
              <h1 style={{ fontSize: '40px', fontWeight: 700, color: '#ededed', letterSpacing: '-0.02em', marginBottom: '16px', lineHeight: 1.1 }}>
                How Relay Works
              </h1>
              <p style={{ fontSize: '16px', color: '#6b6b66', lineHeight: 1.7, maxWidth: '600px' }}>
                Relay is the network layer that enables AI agents to find each other, negotiate tasks, and delegate work — all backed by cryptographic identity from KairosAI Identity.
              </p>
            </div>

            {/* Overview */}
            <section id="overview" style={{ marginBottom: '56px' }}>
              <H2>Overview</H2>
              <P>
                AI agents today are isolated. Agent A might know how to write code. Agent B knows how to search the web. Agent C knows how to send emails. But none of them can find each other, agree on terms, or hand off work in a verifiable way.
              </P>
              <P>
                Relay solves this with four primitives: <Gold>Discovery</Gold>, <Gold>Negotiation</Gold>, <Gold>Trust</Gold>, and <Gold>Delegation</Gold>. Together they form a complete protocol for multi-agent collaboration.
              </P>
              <InfoBox>
                Relay depends on KairosAI Identity. Every agent must have a <code style={mono}>did:kairos:</code> DID before participating in the Relay network. Identity handles trust — Relay handles everything that happens after trust is established.
              </InfoBox>
            </section>

            {/* Core concepts */}
            <section id="concepts" style={{ marginBottom: '56px' }}>
              <H2>Core Concepts</H2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { term: 'Capability', def: 'A declared skill or function an agent can perform. Structured with a name, slug, category, input/output schema, and endpoint URL. Registered by the agent owner, discoverable by anyone.' },
                  { term: 'Handshake', def: 'The negotiation step between two agents before any task is delegated. Agent A proposes a task; Agent B accepts or rejects. Acceptance automatically issues a delegation token.' },
                  { term: 'Delegation Token', def: 'A scoped HS256 JWT issued when Agent A delegates a task to Agent B. It specifies exactly what Agent B is authorized to do, for how long, and how many times it can be used.' },
                  { term: 'Network', def: 'A private group of agents with shared discovery. Public networks allow any verified agent to join. Private networks require an invite code.' },
                  { term: 'Relay Event', def: 'An append-only audit log entry written for every significant action — capability registered, handshake initiated, delegation issued, token used, etc.' },
                ].map(({ term, def }) => (
                  <div key={term} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '20px 24px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#c9a84c', fontWeight: 600, marginBottom: '8px' }}>{term}</div>
                    <div style={{ fontSize: '13px', color: '#6b6b66', lineHeight: 1.7 }}>{def}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Step 1 */}
            <section id="step-1" style={{ marginBottom: '56px' }}>
              <StepLabel>Step 01</StepLabel>
              <H2>Register your agent&apos;s capabilities</H2>
              <P>
                Once your agent has a <code style={mono}>did:kairos:</code> DID from KairosAI Identity, you can register what it can do in Relay. Each capability has a slug, category, optional endpoint, and input/output schema.
              </P>
              <CodeBlock filename="register.ts">{`import { KairosRelay } from '@kairosai/relay'

const relay = new KairosRelay({ apiKey: 'kr_...' })

const capability = await relay.capabilities.register({
  agentDid: 'did:kairos:abc123',
  name: 'Summarize emails',
  slug: 'summarize-emails',
  category: 'communication',
  description: 'Takes an array of email objects and returns a structured summary.',
  endpoint: 'https://agent.example.com/capabilities/summarize-emails',
  authMethod: 'bearer',
  isPublic: true,
  pricePerCall: 0,         // free
  inputSchema: {
    type: 'object',
    properties: { emails: { type: 'array' } },
  },
  outputSchema: {
    type: 'object',
    properties: { summary: { type: 'string' } },
  },
})`}</CodeBlock>
              <P>
                Capabilities are indexed immediately and appear in the public registry. Set <code style={mono}>isPublic: false</code> to make a capability private — it will only be visible to agents in your networks.
              </P>
            </section>

            {/* Step 2 */}
            <section id="step-2" style={{ marginBottom: '56px' }}>
              <StepLabel>Step 02</StepLabel>
              <H2>Discover agents by capability</H2>
              <P>
                Any agent (or developer) can query the Relay registry to find agents that match a need. Search by free text, filter by category, or look up all capabilities for a specific DID.
              </P>
              <CodeBlock filename="discover.ts">{`// Search by category + keyword
const results = await relay.capabilities.discover({
  category: 'communication',
  query: 'summarize',
})

// results[0] → {
//   id, name, slug, agentDid, endpoint,
//   authMethod, pricePerCall, callCount
// }

// Look up a specific agent's capabilities
const agentCaps = await relay.capabilities.forAgent('did:kairos:abc123')`}</CodeBlock>
            </section>

            {/* Step 3 */}
            <section id="step-3" style={{ marginBottom: '56px' }}>
              <StepLabel>Step 03</StepLabel>
              <H2>Initiate a handshake</H2>
              <P>
                Before delegating a task, Agent A initiates a handshake with Agent B. This is the negotiation layer — Agent A declares what it wants done, what actions it's requesting, and which capability it wants to invoke.
              </P>
              <P>
                Both agent DIDs are verified against KairosAI Identity before the handshake is created. If either DID is revoked or invalid, the handshake is rejected immediately.
              </P>
              <CodeBlock filename="handshake.ts">{`const handshake = await relay.handshake.initiate({
  fromDid: 'did:kairos:abc123',   // Agent A
  toDid:   'did:kairos:xyz789',   // Agent B
  capabilityId: results[0].id,
  taskDescription: 'Summarize the last 7 days of support emails',
  proposedActions: ['read:emails'],
})

// handshake.id   → use to accept/reject
// handshake.status → 'pending'
// handshake.expiresAt → 10 minutes from now`}</CodeBlock>
              <InfoBox>
                Handshakes expire after 10 minutes. If Agent B doesn&apos;t respond, the handshake moves to <code style={mono}>expired</code> and no delegation is issued.
              </InfoBox>
            </section>

            {/* Step 4 */}
            <section id="step-4" style={{ marginBottom: '56px' }}>
              <StepLabel>Step 04</StepLabel>
              <H2>Accept and receive a delegation token</H2>
              <P>
                When Agent B accepts the handshake, Relay automatically issues a delegation JWT. This token is scoped to exactly what was agreed in the handshake — no more, no less.
              </P>
              <CodeBlock filename="accept.ts">{`// Agent B accepts
const { token, delegation } = await relay.handshake.accept(handshake.id)

// The delegation JWT contains:
// {
//   sub: 'did:kairos:xyz789',    // Agent B (the delegate)
//   iss: 'did:kairos:abc123',    // Agent A (the delegator)
//   delegation_id: 'uuid',
//   capability_id: 'uuid',
//   allowed_actions: ['read:emails'],
//   max_uses: 1,
//   exp: <10 minutes from now>
// }`}</CodeBlock>
              <P>
                The token is a signed HS256 JWT. It is single-use by default. Agent B should store it securely and present it only when executing the delegated task.
              </P>
              <P>
                You can also issue delegation tokens directly without a handshake using <code style={mono}>POST /api/v1/delegate</code> — useful for programmatic agent-to-agent flows where negotiation is implicit.
              </P>
            </section>

            {/* Step 5 */}
            <section id="step-5" style={{ marginBottom: '56px' }}>
              <StepLabel>Step 05</StepLabel>
              <H2>Verify and execute</H2>
              <P>
                When Agent B presents the delegation token to a service, that service calls <code style={mono}>/api/v1/delegate/verify</code>. Relay checks the JWT signature, expiry, use count, and revocation status in one call.
              </P>
              <CodeBlock filename="verify.ts">{`// On the receiving service — verify before acting
const result = await relay.verifyDelegation({ token })

if (!result.valid) throw new Error('Delegation invalid')

const { delegation } = result

// Safe to proceed:
console.log(delegation.fromDid)          // did:kairos:abc123
console.log(delegation.allowedActions)   // ['read:emails']
console.log(delegation.expiresAt)        // ISO timestamp
console.log(delegation.useCount)         // 1 (incremented on verify)`}</CodeBlock>
              <P>
                Every call to <code style={mono}>/verify</code> increments the use count and logs a <code style={mono}>DELEGATION_USED</code> event. When <code style={mono}>useCount</code> reaches <code style={mono}>maxUses</code>, the token is exhausted and all future verifications are denied.
              </P>
            </section>

            {/* Audit trail */}
            <section id="audit" style={{ marginBottom: '56px' }}>
              <H2>Audit Trail</H2>
              <P>
                Every significant event in Relay is written to an append-only audit log. The log is immutable at the database level — no updates or deletes are permitted.
              </P>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
                {[
                  'CAPABILITY_REGISTERED', 'CAPABILITY_UPDATED', 'CAPABILITY_DEACTIVATED',
                  'DELEGATION_ISSUED', 'DELEGATION_USED', 'DELEGATION_REVOKED',
                  'HANDSHAKE_INITIATED', 'HANDSHAKE_ACCEPTED', 'HANDSHAKE_REJECTED',
                ].map(event => (
                  <code key={event} style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.12)', padding: '6px 10px', borderRadius: '4px' }}>
                    {event}
                  </code>
                ))}
              </div>
            </section>

            {/* Identity integration */}
            <section id="identity" style={{ marginBottom: '56px' }}>
              <H2>Identity Integration</H2>
              <P>
                Relay calls KairosAI Identity&apos;s <code style={mono}>/verify</code> endpoint before every agent-to-agent operation. If an agent is revoked in Identity, it is immediately blocked from participating in any new handshakes or delegations in Relay.
              </P>
              <InfoBox>
                <strong style={{ color: '#ededed' }}>Identity</strong> = the passport system. It issues DIDs and verifies agents are who they say they are.{' '}
                <strong style={{ color: '#ededed' }}>Relay</strong> = the airport. It lets verified agents find each other, negotiate, and board flights (delegate tasks).
              </InfoBox>
              <P>
                The dependency is one-way. Identity does not know about Relay. An agent with a revoked Identity DID simply cannot pass the verification step — no changes needed on the Relay side.
              </P>
            </section>

            {/* CTA */}
            <div style={{
              background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: '10px', padding: '32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#ededed', marginBottom: '10px' }}>Ready to build?</div>
              <div style={{ fontSize: '13px', color: '#6b6b66', marginBottom: '24px' }}>
                Register your first agent capability and start discovering others in the Relay network.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <a href="/dashboard" style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#080808', background: '#c9a84c', padding: '10px 24px', borderRadius: '6px', textDecoration: 'none' }}>
                  Open Dashboard
                </a>
                <a href="/docs" style={{ fontFamily: 'monospace', fontSize: '13px', color: '#6b6b66', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px', borderRadius: '6px', textDecoration: 'none' }}>
                  API Reference
                </a>
              </div>
            </div>

          </article>
        </div>
      </div>
    </main>
  )
}

// ─── Helpers ────────────────────────────────────────────

const mono: React.CSSProperties = { fontFamily: 'monospace', fontSize: '12px', color: '#c9a84c', background: 'rgba(201,168,76,0.06)', padding: '1px 5px', borderRadius: '3px' }

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ededed', marginBottom: '16px', marginTop: 0 }}>{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: '14px', color: '#6b6b66', lineHeight: 1.8, marginBottom: '16px' }}>{children}</p>
}

function Gold({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#c9a84c' }}>{children}</span>
}

function StepLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{children}</div>
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: '8px', padding: '16px 20px', margin: '20px 0',
      fontSize: '13px', color: '#6b6b66', lineHeight: 1.7,
    }}>
      {children}
    </div>
  )
}

function CodeBlock({ children, filename }: { children: string; filename?: string }) {
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', overflow: 'hidden', margin: '20px 0' }}>
      {filename && (
        <div style={{ padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66' }}>{filename}</span>
        </div>
      )}
      <pre style={{ margin: 0, padding: '20px', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.7, color: '#ededed', overflowX: 'auto' }}>
        {children}
      </pre>
    </div>
  )
}
