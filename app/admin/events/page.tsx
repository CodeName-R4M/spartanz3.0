import { fetchCategories, fetchEvents } from '@/lib/data'
import { EventsManager } from '@/components/admin/events-manager'

export const metadata = { title: 'Events · Admin' }

export default async function AdminEventsPage() {
  const [events, categories] = await Promise.all([
    fetchEvents(),
    fetchCategories(),
  ])

  const sorted = [...events].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  )

  return <EventsManager events={sorted} categories={categories} />
}
