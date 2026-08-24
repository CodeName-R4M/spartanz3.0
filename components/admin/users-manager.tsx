'use client'

import { useMemo, useState, useTransition } from 'react'
import { Loader2, Search, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { changeUserRole } from '@/app/actions/admin'
import type { User } from '@/lib/types'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: User[]
  currentUserId: string
}) {
  const [query, setQuery] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    )
  }, [users, query])

  const adminCount = users.filter((u) => u.role === 'admin').length

  function changeRole(user: User, role: 'user' | 'admin') {
    if (role === user.role) return
    setPendingId(user.id)
    startTransition(async () => {
      const res = await changeUserRole(user.id, role)
      setPendingId(null)
      if (res.ok) toast.success(`${user.name} is now ${role}.`)
      else toast.error(res.error ?? 'Update failed.')
    })
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          Access Control
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} accounts · {adminCount} admin
          {adminCount === 1 ? '' : 's'}
        </p>
      </header>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="py-10 text-center text-muted-foreground"
                >
                  No users match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => {
                const isSelf = user.id === currentUserId
                const isLastAdmin = user.role === 'admin' && adminCount <= 1
                const lockDemote = isSelf || isLastAdmin
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarImage
                            src={user.avatarUrl || undefined}
                            alt=""
                          />
                          <AvatarFallback className="text-xs">
                            {initials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
                            {user.name}
                            {isSelf ? (
                              <span className="text-xs text-muted-foreground">
                                (you)
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(v) => {
                            if (v) changeRole(user, v as 'user' | 'admin')
                          }}
                        >
                          <SelectTrigger className="h-8 w-32 gap-2">
                            {pendingId === user.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Badge
                                variant={
                                  user.role === 'admin'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="gap-1 capitalize"
                              >
                                {user.role === 'admin' ? (
                                  <ShieldCheck className="size-3" />
                                ) : null}
                                {user.role}
                              </Badge>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user" disabled={lockDemote}>
                              User
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {lockDemote ? (
                          <span className="hidden text-xs text-muted-foreground lg:inline">
                            {isSelf ? 'cannot demote self' : 'last admin'}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
