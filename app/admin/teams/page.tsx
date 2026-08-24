import { fetchTeam } from '@/lib/data'
import { TeamManager } from '@/components/admin/team-manager'

export const metadata = { title: 'Team · Admin' }

export default async function AdminTeamPage() {
  const team = await fetchTeam()
  const sorted = [...team].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  )
  return <TeamManager members={sorted} />
}
