'use client'

import { useMemo, useState, useTransition } from 'react'
import { Loader2, Pencil, Plus, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ConfirmDelete } from '@/components/admin/confirm-delete'
import { deleteTeamMember, upsertTeamMember } from '@/app/actions/admin'
import {
  TEAM_CATEGORIES,
  type TeamCategorySlug,
  type TeamMember,
} from '@/lib/types'

const CATEGORY_LABEL = new Map(TEAM_CATEGORIES.map((c) => [c.slug, c.label]))

const EMPTY: Partial<TeamMember> = {
  name: '',
  role: '',
  category: 'organizing-committee',
  photo: '',
  shortBio: '',
  department: '',
  year: '',
  displayOrder: 99,
  active: true,
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TeamManager({ members }: { members: TeamMember[] }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Partial<TeamMember>>(EMPTY)
  const [filter, setFilter] = useState<string>('all')
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(
    () =>
      filter === 'all'
        ? members
        : members.filter((m) => m.category === filter),
    [members, filter],
  )

  function openNew() {
    setDraft({ ...EMPTY })
    setOpen(true)
  }
  function openEdit(m: TeamMember) {
    setDraft({ ...m })
    setOpen(true)
  }

  function save() {
    if (!draft.name?.trim()) {
      toast.error('Member name is required.')
      return
    }
    startTransition(async () => {
      const res = await upsertTeamMember({ ...draft, name: draft.name! })
      if (res.ok) {
        toast.success('Team member saved.')
        setOpen(false)
      } else {
        toast.error(res.error ?? 'Save failed.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            The Crew
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
            Team
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members.length} member{members.length === 1 ? '' : 's'} across{' '}
            {TEAM_CATEGORIES.length} groups
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          Add member
        </Button>
      </header>

      <div className="max-w-xs">
        <Select value={filter} onValueChange={(v) => setFilter(v ?? 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All groups</SelectItem>
            {TEAM_CATEGORIES.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          No team members in this group yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <article
              key={m.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={m.photo || undefined} alt="" />
                    <AvatarFallback>{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {m.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {m.role || '—'}
                    </p>
                  </div>
                </div>
                {!m.active ? (
                  <Badge variant="secondary" className="shrink-0">
                    Hidden
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <UsersRound className="size-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {CATEGORY_LABEL.get(m.category as TeamCategorySlug) ??
                    m.category}
                </span>
              </div>

              {m.shortBio ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {m.shortBio}
                </p>
              ) : null}

              <div className="mt-auto flex items-center justify-end gap-1 border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => openEdit(m)}
                  aria-label={`Edit ${m.name}`}
                >
                  <Pencil className="size-4" />
                </Button>
                <ConfirmDelete
                  title={`Remove ${m.name}?`}
                  description="This removes the member from the public team page."
                  onConfirm={() => deleteTeamMember(m.id, m.name)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Edit member' : 'Add member'}
            </DialogTitle>
            <DialogDescription>
              Appears on the public Team page when active.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={draft.name ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={draft.role ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, role: e.target.value }))
                  }
                  placeholder="e.g. Lead Coordinator"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Group</Label>
              <Select
                value={draft.category ?? 'organizing-committee'}
                onValueChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    category: (v ?? 'organizing-committee') as TeamCategorySlug,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Photo URL</Label>
              <Input
                value={draft.photo ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, photo: e.target.value }))
                }
                placeholder="/team/avatar-1.png"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={draft.department ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, department: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  value={draft.year ?? ''}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, year: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Short bio</Label>
              <Textarea
                rows={3}
                value={draft.shortBio ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, shortBio: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Display order</Label>
                <Input
                  type="number"
                  value={draft.displayOrder ?? 99}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      displayOrder: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Show publicly</p>
                </div>
                <Switch
                  checked={draft.active ?? true}
                  onCheckedChange={(v) =>
                    setDraft((d) => ({ ...d, active: v }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={pending} className="gap-2">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
