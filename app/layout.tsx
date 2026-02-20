import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CasaFresh Mission Control',
  description: 'Internal operations dashboard — live agent activity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0A0F1A] text-gray-100 antialiased">
        {children}
      </body>
    </html>
  )
}
