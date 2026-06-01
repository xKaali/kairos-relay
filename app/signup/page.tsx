'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '40px', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✓</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#ededed', marginBottom: '8px' }}>Check your email</div>
          <div style={{ fontSize: '13px', color: '#6b6b66' }}>We sent a confirmation link to <strong style={{ color: '#ededed' }}>{email}</strong>. Click it to activate your account.</div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)',
        backgroundSize: '48px 48px', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image src="/KairosLogo.png" alt="KairosAI" width={40} height={40} style={{ borderRadius: '10px', marginBottom: '16px' }} />
          <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            KairosAI <span style={{ color: '#c9a84c' }}>Relay</span>
          </div>
        </div>

        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#ededed', marginBottom: '24px', textAlign: 'center' }}>Create account</h1>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px 14px', color: '#ededed', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: '#6b6b66', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                placeholder="Min. 8 characters"
                style={{ width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '10px 14px', color: '#ededed', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', background: '#c9a84c', color: '#080808', border: 'none', borderRadius: '6px',
              padding: '11px', fontSize: '14px', fontFamily: 'monospace', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6b6b66' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#c9a84c', textDecoration: 'none' }}>Sign in</a>
          </div>
        </div>
      </div>
    </main>
  )
}
