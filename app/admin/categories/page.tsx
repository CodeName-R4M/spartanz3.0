import { fetchCategories, fetchEvents } from '@/lib/data'
import { CategoriesManager } from '@/components/admin/categories-manager'

export const metadata = { title: 'Categories · Admin' }

export default async function AdminCategoriesPage() {
  const [categories, events] = await Promise.all([
    fetchCategories(),
    fetchEvents(),
  ])

  const sorted = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  )

  // Count how many events use each category so the UI can warn before delete.
  const usage: Record<string, number> = {}
  for (const cat of sorted) {
    usage[cat.slug] = events.filter((e) => e.category === cat.slug).length
  }

  return <CategoriesManager categories={sorted} usage={usage} />
}
