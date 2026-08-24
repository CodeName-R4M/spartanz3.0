import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { AdminShell } from '@/components/admin/admin-shell'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

// Server-side authorization boundary for the whole /admin tree. Hiding the
// nav link is never sufficient — every admin page renders inside this guard,
// and every mutating action re-checks requireAdmin() on its own.
export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) redirect('/login?next=/admin')
  if (user.role !== 'admin') redirect('/')

  return (
    <AdminShell userName={user.name} userEmail={user.email}>
      {children}
    </AdminShell>
  )
}
