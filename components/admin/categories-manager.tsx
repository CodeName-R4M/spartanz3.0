'use client'

import { useState, useTransition } from 'react'
import { ListTree, Loader2, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfirmDelete } from '@/components/admin/confirm-delete'
import { deleteCategory, upsertCategory } from '@/app/actions/admin'
import type { EventCategory } from '@/lib/types'

const EMPTY: Partial<EventCategory> = {
  name: '',
  slug: '',
  active: true,
  displayOrder: 99,
}

export function CategoriesManager({
  categories,
  usage,
}: {
  categories: EventCategory[]
  usage: Record<string, number>
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Partial<EventCategory>>(EMPTY)
  const [pending, startTransition] = useTransition()

  function openNew() {
    setDraft({ ...EMPTY })
    setOpen(true)
  }
  function openEdit(cat: EventCategory) {
    setDraft({ ...cat })
    setOpen(true)
  }

  function save() {
    if (!draft.name?.trim()) {
      toast.error('Category name is required.')
      return
    }
    startTransition(async () => {
      const res = await upsertCategory({ ...draft, name: draft.name! })
      if (res.ok) {
        toast.success('Category saved.')
        setOpen(false)
      } else {
        toast.error(res.error ?? 'Save failed.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Taxonomy
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} ·
            groups events across the site
          </p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="size-4" />
          New category
        </Button>
      </header>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Category</TableHead>
              <TableHead className="hidden sm:table-cell">Slug</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No categories yet. Create your first one.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <ListTree className="size-4 text-primary" />
                      {cat.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    {cat.slug}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {usage[cat.slug] ?? 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cat.active ? 'default' : 'secondary'}>
                      {cat.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(cat)}
                        aria-label={`Edit ${cat.name}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title={`Delete ${cat.name}?`}
                        description={
                          (usage[cat.slug] ?? 0) > 0
                            ? `${usage[cat.slug]} event(s) still use this category and must be moved first.`
                            : 'This category will be removed permanently.'
                        }
                        onConfirm={() => deleteCategory(cat.id, cat.name)}
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? 'Edit category' : 'New category'}
            </DialogTitle>
            <DialogDescription>
              Used to group and filter events on the public site.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={draft.name ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="Technical"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (optional)</Label>
              <Input
                value={draft.slug ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, slug: e.target.value }))
                }
                placeholder="Auto-generated from name if left blank"
              />
            </div>
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
                <p className="text-xs text-muted-foreground">
                  Show this category and its events publicly.
                </p>
              </div>
              <Switch
                checked={draft.active ?? true}
                onCheckedChange={(v) =>
                  setDraft((d) => ({ ...d, active: v }))
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
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
