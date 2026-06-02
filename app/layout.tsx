import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kairos — KairosAI Relay',
  description: 'Agent discovery and communication for the AI economy.',
  icons: {
    icon: '/KairosLogo.png',
    apple: '/KairosLogo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
