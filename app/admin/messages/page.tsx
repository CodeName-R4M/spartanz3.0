import { fetchMessages } from '@/lib/data'
import { MessagesManager } from '@/components/admin/messages-manager'

export const metadata = { title: 'Messages · Admin' }

export default async function AdminMessagesPage() {
  const messages = await fetchMessages()
  const sorted = [...messages].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  return <MessagesManager messages={sorted} />
}
