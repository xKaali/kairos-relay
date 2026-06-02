import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kairos — KairosAI Relay',
  description: 'Agent discovery and communication for the AI economy.',
  icons: {
    icon: '/KairosLogo.png',
    shortcut: '/KairosLogo.png',
    apple: '/KairosLogo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, background: '#080808' }}>
      <head>
        <link rel="icon" href="/KairosLogo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/KairosLogo.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#080808' }}>{children}</body>
    </html>
  )
}
