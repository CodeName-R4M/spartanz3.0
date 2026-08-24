import { fetchSettings } from '@/lib/data'
import { SettingsManager } from '@/components/admin/settings-manager'

export const metadata = { title: 'Settings · Admin' }

export default async function AdminSettingsPage() {
  const settings = await fetchSettings()
  return <SettingsManager settings={settings} />
}
