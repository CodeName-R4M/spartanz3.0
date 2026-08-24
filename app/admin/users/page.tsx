import { fetchUsers } from '@/lib/data'
import { getCurrentUser } from '@/lib/session'
import { UsersManager } from '@/components/admin/users-manager'

export const metadata = { title: 'Users · Admin' }

export default async function AdminUsersPage() {
  const [users, current] = await Promise.all([fetchUsers(), getCurrentUser()])

  const sorted = [...users].sort((a, b) => {
    if (a.role !== b.role) return a.role === 'admin' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return <UsersManager users={sorted} currentUserId={current?.id ?? ''} />
}
