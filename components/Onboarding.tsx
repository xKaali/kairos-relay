'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface OnboardingProps {
  onComplete: () => void
}

type Step = 'welcome' | 'creating' | 'done'

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [keyName, setKeyName] = useState('default')
  const [newKey, setNewKey] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function createKey() {
    setStep('creating')
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setStep('welcome'); return }

    const res = await fetch('/api/v1/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ name: keyName.trim() || 'default' }),
    })

    const json = await res.json() as { success: boolean; error?: string; data?: { key: string } }

    if (!res.ok) {
      setError(json.error ?? 'Failed to create key')
      setStep('welcome')
      return
    }

    const key = json.data!.key
    setNewKey(key)
    localStorage.setItem('relay_api_key', key)
    setStep('done')
  }

  function copy() {
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0d0d0d', border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '14px', padding: '40px', maxWidth: '480px', width: '100%', margin: '24px',
      }}>

        {step === 'welcome' && (
          <>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>👋</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ededed', marginBottom: '8px' }}>
              Welcome to KairosAI Relay
            </h2>
            <p style={{ fontSize: '13px', color: '#6b6b66', lineHeight: 1.7, marginBottom: '28px' }}>
              Before you can register capabilities, delegate tasks, or discover agents — you need an API key. Let&apos;s create your first one now.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Key name
              </label>
              <input
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                placeholder="e.g. production, dev"
                style={{
                  width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '6px', padding: '10px 14px', color: '#ededed',
                  fontFamily: 'monospace', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#ef4444', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button onClick={createKey} style={{
              width: '100%', background: '#c9a84c', color: '#080808', border: 'none',
              borderRadius: '6px', padding: '12px', fontSize: '14px',
              fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer',
            }}>
              Create API Key →
            </button>
          </>
        )}

        {step === 'creating' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '13px', color: '#6b6b66' }}>Creating your API key…</div>
          </div>
        )}

        {step === 'done' && (
          <>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔑</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ededed', marginBottom: '8px' }}>
              Your API key is ready
            </h2>
            <p style={{ fontSize: '13px', color: '#ef4444', lineHeight: 1.6, marginBottom: '20px' }}>
              Copy this key now — it will never be shown again.
            </p>

            <div style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '8px', padding: '14px 16px', marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px', color: '#c9a84c', wordBreak: 'break-all' }}>
                {newKey}
              </code>
              <button onClick={copy} style={{
                background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(201,168,76,0.1)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.3)'}`,
                color: copied ? '#22c55e' : '#c9a84c',
                borderRadius: '6px', padding: '6px 12px', fontSize: '11px',
                fontFamily: 'monospace', cursor: 'pointer', flexShrink: 0,
              }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#6b6b66', marginBottom: '24px' }}>
              It&apos;s been saved to your browser for this session. You can manage all keys from the API Keys page.
            </p>

            {/* Steps preview */}
            <div style={{ background: '#111', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>What to do next</div>
              {[
                { step: '1', label: 'Register a capability', href: '/capabilities', desc: 'Declare what your agent can do' },
                { step: '2', label: 'Discover agents', href: '/discover', desc: 'Find agents to collaborate with' },
                { step: '3', label: 'Delegate a task', href: '/delegations', desc: 'Issue your first delegation token' },
              ].map(({ step, label, href, desc }) => (
                <a key={step} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0',
                  textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', width: '16px', flexShrink: 0 }}>{step}</span>
                  <div>
                    <div style={{ fontSize: '13px', color: '#ededed', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '11px', color: '#6b6b66' }}>{desc}</div>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#6b6b66', fontSize: '14px' }}>›</span>
                </a>
              ))}
            </div>

            <button onClick={() => onComplete()} style={{
              width: '100%', background: '#c9a84c', color: '#080808', border: 'none',
              borderRadius: '6px', padding: '12px', fontSize: '14px',
              fontFamily: 'monospace', fontWeight: 700, cursor: 'pointer',
            }}>
              Go to Dashboard →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
