import { fetchEvents, fetchRegistrations } from '@/lib/data'
import { RegistrationsManager } from '@/components/admin/registrations-manager'

export const metadata = { title: 'Registrations · Admin' }

export default async function AdminRegistrationsPage() {
  const [registrations, events] = await Promise.all([
    fetchRegistrations(),
    fetchEvents(),
  ])

  const sorted = [...registrations].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )

  const eventOptions = events
    .map((e) => ({ id: e.id, name: e.name }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <RegistrationsManager
      registrations={sorted}
      eventOptions={eventOptions}
    />
  )
}
