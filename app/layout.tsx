import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'SPARTANZ 3.0 | CSE Cyber Security Symposium',
    template: '%s | SPARTANZ 3.0',
  },
  description:
    'SPARTANZ 3.0 — Department Symposium by the CSE — Cyber Security Department of New Prince Shri Bhavani College of Engineering, organized with RootSec Club.',
  keywords: [
    'SPARTANZ 3.0',
    'symposium',
    'CSE Cyber Security',
    'RootSec Club',
    'New Prince Shri Bhavani College of Engineering',
    'technical events',
  ],
  openGraph: {
    title: 'SPARTANZ 3.0 | CSE Cyber Security Symposium',
    description:
      'SPARTANZ 3.0 — Department Symposium by the CSE — Cyber Security Department of New Prince Shri Bhavani College of Engineering, organized with RootSec Club.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPARTANZ 3.0 | CSE Cyber Security Symposium',
    description:
      'Department Symposium by CSE — Cyber Security, organized with RootSec Club.',
  },
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#1a0505',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} bg-background`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
