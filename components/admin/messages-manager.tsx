'use client'

import { useMemo, useState, useTransition } from 'react'
import { Loader2, Mail, MailOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDelete } from '@/components/admin/confirm-delete'
import { deleteMessage, markMessageRead } from '@/app/actions/admin'
import type { ContactMessage } from '@/lib/types'

export function MessagesManager({
  messages,
}: {
  messages: ContactMessage[]
}) {
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const unreadCount = messages.filter((m) => !m.read).length

  const visible = useMemo(
    () => (tab === 'unread' ? messages.filter((m) => !m.read) : messages),
    [messages, tab],
  )

  function toggleRead(msg: ContactMessage) {
    setPendingId(msg.id)
    startTransition(async () => {
      const res = await markMessageRead(msg.id, !msg.read)
      setPendingId(null)
      if (!res.ok) toast.error(res.error ?? 'Update failed.')
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Inbox
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
            Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {messages.length} total · {unreadCount} unread
          </p>
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'unread')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread" className="gap-1.5">
              Unread
              {unreadCount > 0 ? (
                <Badge variant="default" className="h-5 px-1.5">
                  {unreadCount}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          {tab === 'unread' ? 'No unread messages.' : 'No messages yet.'}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((msg) => (
            <li
              key={msg.id}
              className={`rounded-lg border p-5 transition-colors ${
                msg.read
                  ? 'border-border bg-card'
                  : 'border-primary/40 bg-primary/5'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {!msg.read ? (
                      <span
                        className="size-2 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                    ) : null}
                    <p className="font-semibold text-foreground">
                      {msg.subject || '(no subject)'}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {msg.name} ·{' '}
                    <a
                      href={`mailto:${msg.email}`}
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      {msg.email}
                    </a>
                  </p>
                </div>
                <time className="shrink-0 font-mono text-xs text-muted-foreground">
                  {new Date(msg.createdAt).toLocaleString()}
                </time>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                {msg.message}
              </p>

              <div className="mt-4 flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => toggleRead(msg)}
                  disabled={pendingId === msg.id}
                >
                  {pendingId === msg.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : msg.read ? (
                    <Mail className="size-4" />
                  ) : (
                    <MailOpen className="size-4" />
                  )}
                  {msg.read ? 'Mark unread' : 'Mark read'}
                </Button>
                <ConfirmDelete
                  title="Delete this message?"
                  description={`Message from ${msg.name} will be permanently removed.`}
                  onConfirm={() => deleteMessage(msg.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
