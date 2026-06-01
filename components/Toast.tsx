'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const toastColor: Record<ToastType, { bg: string; border: string; dot: string }> = {
  success: { bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',  dot: '#22c55e' },
  error:   { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)',  dot: '#ef4444' },
  info:    { bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.2)', dot: '#c9a84c' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)
  const colors = toastColor[toast.type]

  useEffect(() => {
    // Animate in
    const show = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss
    const dismiss = setTimeout(() => {
      setVisible(false)
      setTimeout(onRemove, 300)
    }, 3500)
    return () => { clearTimeout(show); clearTimeout(dismiss) }
  }, [onRemove])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '280px', maxWidth: '380px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      transition: 'all 0.25s ease',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
      cursor: 'pointer',
    }} onClick={() => { setVisible(false); setTimeout(onRemove, 300) }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
      <span style={{ fontSize: '13px', color: '#ededed', lineHeight: 1.4, flex: 1 }}>{toast.message}</span>
      <span style={{ fontSize: '14px', color: '#6b6b66', flexShrink: 0, marginLeft: '4px' }}>✕</span>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const value: ToastContextValue = {
    toast,
    success: (msg) => toast(msg, 'success'),
    error:   (msg) => toast(msg, 'error'),
    info:    (msg) => toast(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast stack */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 200, pointerEvents: 'none',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={t} onRemove={() => remove(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
