'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useState, useEffect } from 'react'
import { ToastProvider } from '@/components/Toast'

const NAV = [
  { href: '/dashboard',    label: 'Overview',      icon: '⊞' },
  { href: '/capabilities', label: 'Capabilities',  icon: '◈' },
  { href: '/discover',     label: 'Discover',      icon: '⊙' },
  { href: '/delegations',  label: 'Delegations',   icon: '⇄' },
  { href: '/networks',     label: 'Networks',      icon: '⬡' },
  { href: '/api-keys',     label: 'API Keys',      icon: '⚿' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? '')
    })
  }, [supabase.auth])

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/home')
  }

  return (
    <ToastProvider>
    <div style={{ display: 'flex', minHeight: '100vh', background: '#080808' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: '#080808',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>

        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <Image src="/KairosLogo.png" alt="KairosAI" width={28} height={28} style={{ borderRadius: '7px' }} />
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ededed', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>KairosAI</div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#c9a84c', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Relay</div>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '6px',
                marginBottom: '2px',
                textDecoration: 'none',
                background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                border: active ? '1px solid rgba(201,168,76,0.15)' : '1px solid transparent',
                color: active ? '#ededed' : '#6b6b66',
                fontSize: '13px',
                fontFamily: 'system-ui, sans-serif',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '14px', color: active ? '#c9a84c' : '#6b6b66', width: '16px', textAlign: 'center' }}>{icon}</span>
                {label}
                {active && <span style={{ marginLeft: 'auto', color: '#c9a84c', opacity: 0.5, fontSize: '12px' }}>›</span>}
              </Link>
            )
          })}

          <div style={{ margin: '16px 0 8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
            <Link href="/docs" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '6px', textDecoration: 'none',
              color: '#6b6b66', fontSize: '13px', border: '1px solid transparent',
            }}>
              <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>📖</span>
              API Docs
            </Link>
            <Link href="/registry" style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '6px', textDecoration: 'none',
              color: '#6b6b66', fontSize: '13px', border: '1px solid transparent',
            }}>
              <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>🌐</span>
              Public Registry
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ padding: '8px 12px', marginBottom: '4px' }}>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b6b66', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {email || '—'}
            </div>
          </div>
          <button onClick={signOut} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '6px', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b6b66', fontSize: '13px', fontFamily: 'system-ui, sans-serif',
          }}>
            <span style={{ fontSize: '14px', width: '16px', textAlign: 'center' }}>↪</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        marginLeft: '220px',
        flex: 1,
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(#141414 1px, transparent 1px), linear-gradient(90deg, #141414 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}>
        {children}
      </main>
    </div>
    </ToastProvider>
  )
}
