'use client'

import { useState, useRef, useEffect } from 'react'

interface InfoTipProps {
  text: string
  width?: number
}

export default function InfoTip({ text, width = 240 }: InfoTipProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<'above' | 'below'>('above')
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!visible || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos(rect.top < 120 ? 'below' : 'above')
  }, [visible])

  return (
    <span
      ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
    >
      {/* Circle i icon */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '15px', height: '15px', borderRadius: '50%',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: visible ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.15)',
        color: visible ? '#c9a84c' : '#6b6b66',
        fontSize: '9px', fontFamily: 'serif',
        fontStyle: 'italic', fontWeight: 700,
        cursor: 'default', userSelect: 'none',
        transition: 'border-color 0.15s, color 0.15s',
      }}>
        i
      </span>

      {/* Tooltip */}
      {visible && (
        <span style={{
          position: 'absolute',
          [pos === 'above' ? 'bottom' : 'top']: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${width}px`,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '12px',
          color: '#a0a0a0',
          lineHeight: 1.6,
          zIndex: 50,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          whiteSpace: 'normal',
          textAlign: 'left',
        }}>
          {/* Arrow */}
          <span style={{
            position: 'absolute',
            [pos === 'above' ? 'bottom' : 'top']: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px', height: '8px',
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderTop: pos === 'above' ? 'none' : undefined,
            borderLeft: pos === 'above' ? 'none' : undefined,
            borderBottom: pos === 'below' ? 'none' : undefined,
            borderRight: pos === 'below' ? 'none' : undefined,
            rotate: pos === 'above' ? '45deg' : '225deg',
          }} />
          {text}
        </span>
      )}
    </span>
  )
}
