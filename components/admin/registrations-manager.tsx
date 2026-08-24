'use client'

import { useMemo, useState, useTransition } from 'react'
import { Download, Eye, Loader2, Search, Ticket } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ConfirmDelete } from '@/components/admin/confirm-delete'
import {
  deleteRegistration,
  setRegistrationStatus,
} from '@/app/actions/admin'
import {
  REGISTRATION_STATUSES,
  type Registration,
  type RegistrationStatus,
} from '@/lib/types'

const STATUS_VARIANT: Record<
  RegistrationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  registered: 'outline',
  confirmed: 'default',
  attended: 'secondary',
  cancelled: 'destructive',
}

export function RegistrationsManager({
  registrations,
  eventOptions,
}: {
  registrations: Registration[]
  eventOptions: { id: string; name: string }[]
}) {
  const [query, setQuery] = useState('')
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [detail, setDetail] = useState<Registration | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const eventName = useMemo(
    () => new Map(eventOptions.map((e) => [e.id, e.name])),
    [eventOptions],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return registrations.filter((r) => {
      if (eventFilter !== 'all' && r.eventId !== eventFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (!q) return true
      return (
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.college.toLowerCase().includes(q) ||
        (r.teamName ?? '').toLowerCase().includes(q)
      )
    })
  }, [registrations, query, eventFilter, statusFilter])

  function changeStatus(reg: Registration, status: RegistrationStatus) {
    setPendingId(reg.id)
    startTransition(async () => {
      const res = await setRegistrationStatus(reg.id, status)
      setPendingId(null)
      if (res.ok) toast.success(`Marked ${status}.`)
      else toast.error(res.error ?? 'Update failed.')
    })
  }

  function exportCsv() {
    const rows = [
      [
        'Name',
        'Email',
        'Phone',
        'College',
        'Department',
        'Year',
        'Event',
        'Team',
        'Members',
        'Status',
        'Registered',
      ],
      ...filtered.map((r) => [
        r.fullName,
        r.email,
        r.phone,
        r.college,
        r.department,
        r.year,
        eventName.get(r.eventId) ?? r.eventId,
        r.teamName ?? '',
        r.members.map((m) => m.name).join('; '),
        r.status,
        r.createdAt,
      ]),
    ]
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spartanz-registrations-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Attendee Ledger
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
            Registrations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} of {registrations.length} shown
          </p>
        </div>
        <Button
          variant="secondary"
          className="gap-2"
          onClick={exportCsv}
          disabled={filtered.length === 0}
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, college, team…"
            className="pl-9"
          />
        </div>
        <Select
          value={eventFilter}
          onValueChange={(v) => setEventFilter(v ?? 'all')}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {eventOptions.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? 'all')}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {REGISTRATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Attendee</TableHead>
              <TableHead className="hidden md:table-cell">Event</TableHead>
              <TableHead className="hidden lg:table-cell">College</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No registrations match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Ticket className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {reg.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {reg.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {eventName.get(reg.eventId) ?? '—'}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {reg.college}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={reg.status}
                      onValueChange={(v) =>
                        changeStatus(reg, v as RegistrationStatus)
                      }
                    >
                      <SelectTrigger className="h-8 w-36 gap-2">
                        {pendingId === reg.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : null}
                        <Badge
                          variant={STATUS_VARIANT[reg.status]}
                          className="capitalize"
                        >
                          {reg.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {REGISTRATION_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setDetail(reg)}
                        aria-label={`View ${reg.fullName}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title={`Delete ${reg.fullName}'s registration?`}
                        description="This permanently removes the registration record."
                        onConfirm={() =>
                          deleteRegistration(reg.id, reg.fullName)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{detail?.fullName}</DialogTitle>
            <DialogDescription>
              Registration for {detail ? eventName.get(detail.eventId) : ''}
            </DialogDescription>
          </DialogHeader>
          {detail ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-2 text-sm">
              <Detail label="Email" value={detail.email} />
              <Detail label="Phone" value={detail.phone} />
              <Detail label="College" value={detail.college} />
              <Detail label="Department" value={detail.department} />
              <Detail label="Year" value={detail.year} />
              <Detail label="Status" value={detail.status} />
              {detail.teamName ? (
                <Detail label="Team" value={detail.teamName} />
              ) : null}
              <div className="col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Members
                </dt>
                <dd className="mt-1 text-foreground">
                  {detail.members.length
                    ? detail.members
                        .map((m) => m.name + (m.email ? ` (${m.email})` : ''))
                        .join(', ')
                    : 'Solo entry'}
                </dd>
              </div>
              <Detail
                label="Registered"
                value={new Date(detail.createdAt).toLocaleString()}
              />
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 capitalize text-foreground">{value || '—'}</dd>
    </div>
  )
}
