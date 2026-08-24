'use client'

import { useState, useTransition } from 'react'
import { Pencil, Plus, Loader2, CalendarClock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { deleteEvent, upsertEvent } from '@/app/actions/admin'
import type { EventCategory, EventItem } from '@/lib/types'

const EMPTY: Partial<EventItem> = {
  name: '',
  category: '',
  shortDescription: '',
  description: '',
  venue: '',
  date: '',
  startTime: '',
  endTime: '',
  registrationFee: 0,
  prizes: '',
  teamSize: { min: 1, max: 1 },
  coordinator: { name: '', phone: '' },
  status: 'active',
  rules: [],
}

export function EventsManager({
  events,
  categories,
}: {
  events: EventItem[]
  categories: EventCategory[]
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Partial<EventItem>>(EMPTY)
  const [pending, startTransition] = useTransition()

  function openNew() {
    setDraft({ ...EMPTY, category: categories[0]?.slug ?? '' })
    setOpen(true)
  }
  function openEdit(ev: EventItem) {
    setDraft({ ...ev })
    setOpen(true)
  }

  function save() {
    if (!draft.name?.trim()) {
      toast.error('Event name is required.')
      return
    }
    startTransition(async () => {
      const res = await upsertEvent({
        ...draft,
        name: draft.name!,
        rules:
          typeof (draft as { rulesText?: string }).rulesText === 'string'
            ? (draft as { rulesText?: string }).rulesText!
                .split('\n')
                .map((r) => r.trim())
                .filter(Boolean)
            : draft.rules,
      })
      if (res.ok) {
        toast.success('Event saved.')
        setOpen(false)
      } else {
        toast.error(res.error ?? 'Save failed.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-glow">
            Events
          </h1>
          <p className="text-sm text-muted-foreground">
            {events.length} event{events.length === 1 ? '' : 's'} in the arena
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          New event
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Event</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No events yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-primary" />
                      {ev.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden capitalize md:table-cell text-muted-foreground">
                    {ev.category}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {ev.date || '—'}
                  </TableCell>
                  <TableCell>{ev.registrationFee ? `₹${ev.registrationFee}` : 'Free'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ev.status === 'active' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {ev.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(ev)}
                        aria-label={`Edit ${ev.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title={`Delete ${ev.name}?`}
                        description="Registrations linked to this event will be affected."
                        onConfirm={() => deleteEvent(ev.id, ev.name)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft.id ? 'Edit event' : 'New event'}</DialogTitle>
            <DialogDescription>
              Details shown on the public event page and registration form.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <Input
                value={draft.name ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Capture The Flag"
              />
            </Field>
            <Field label="Category">
              <Select
                value={draft.category}
                onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Venue">
              <Input
                value={draft.venue ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))}
                placeholder="Lab 3, Block A"
              />
            </Field>
            <Field label="Short description" className="sm:col-span-2">
              <Input
                value={draft.shortDescription ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, shortDescription: e.target.value }))
                }
                placeholder="One-line hook for the card"
              />
            </Field>
            <Field label="Full description" className="sm:col-span-2">
              <Textarea
                rows={3}
                value={draft.description ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
              />
            </Field>
            <Field label="Rules (one per line)" className="sm:col-span-2">
              <Textarea
                rows={3}
                defaultValue={(draft.rules ?? []).join('\n')}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...(d as object),
                    rulesText: e.target.value,
                  }))
                }
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={draft.date ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start">
                <Input
                  type="time"
                  value={draft.startTime ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, startTime: e.target.value }))
                  }
                />
              </Field>
              <Field label="End">
                <Input
                  type="time"
                  value={draft.endTime ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, endTime: e.target.value }))
                  }
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Team min">
                <Input
                  type="number"
                  min={1}
                  value={draft.teamSize?.min ?? 1}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      teamSize: {
                        min: Number(e.target.value),
                        max: d.teamSize?.max ?? Number(e.target.value),
                      },
                    }))
                  }
                />
              </Field>
              <Field label="Team max">
                <Input
                  type="number"
                  min={1}
                  value={draft.teamSize?.max ?? 1}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      teamSize: {
                        min: d.teamSize?.min ?? 1,
                        max: Number(e.target.value),
                      },
                    }))
                  }
                />
              </Field>
            </div>
            <Field label="Registration fee (₹)">
              <Input
                type="number"
                min={0}
                value={draft.registrationFee ?? 0}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    registrationFee: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Prizes">
              <Input
                value={draft.prizes ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, prizes: e.target.value }))}
                placeholder="₹10,000 pool"
              />
            </Field>
            <Field label="Coordinator name">
              <Input
                value={draft.coordinator?.name ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    coordinator: {
                      name: e.target.value,
                      phone: d.coordinator?.phone ?? '',
                    },
                  }))
                }
              />
            </Field>
            <Field label="Coordinator phone">
              <Input
                value={draft.coordinator?.phone ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    coordinator: {
                      name: d.coordinator?.name ?? '',
                      phone: e.target.value,
                    },
                  }))
                }
              />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 sm:col-span-2">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Visible to attendees and open for registration.
                </p>
              </div>
              <Switch
                checked={draft.status !== 'disabled'}
                onCheckedChange={(v) =>
                  setDraft((d) => ({ ...d, status: v ? 'active' : 'disabled' }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending} className="gap-2">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}
