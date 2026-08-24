'use client'

import { useState, useTransition } from 'react'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { updateSettings } from '@/app/actions/admin'
import type { SiteSettings } from '@/lib/types'

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function SettingsManager({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState<SiteSettings>(settings)
  const [pending, startTransition] = useTransition()

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function setSocial(i: number, patch: Partial<{ label: string; url: string }>) {
    setForm((f) => ({
      ...f,
      socials: f.socials.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }))
  }
  function addSocial() {
    setForm((f) => ({ ...f, socials: [...f.socials, { label: '', url: '' }] }))
  }
  function removeSocial(i: number) {
    setForm((f) => ({ ...f, socials: f.socials.filter((_, idx) => idx !== i) }))
  }

  function save() {
    if (!form.symposiumName.trim()) {
      toast.error('Symposium name is required.')
      return
    }
    startTransition(async () => {
      const res = await updateSettings({
        ...form,
        socials: form.socials.filter((s) => s.label.trim() && s.url.trim()),
      })
      if (res.ok) toast.success('Settings saved.')
      else toast.error(res.error ?? 'Save failed.')
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
            Configuration
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold uppercase text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global content shown across the public site.
          </p>
        </div>
        <Button onClick={save} disabled={pending} className="gap-2">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </header>

      <Section title="Identity" description="Names and branding.">
        <Field
          label="Symposium name"
          value={form.symposiumName}
          onChange={(v) => set('symposiumName', v)}
          placeholder="SPARTANZ 3.0"
        />
        <Field
          label="Subtitle"
          value={form.subtitle}
          onChange={(v) => set('subtitle', v)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="College"
            value={form.college}
            onChange={(v) => set('college', v)}
          />
          <Field
            label="Department"
            value={form.department}
            onChange={(v) => set('department', v)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Club"
            value={form.club}
            onChange={(v) => set('club', v)}
          />
          <Field
            label="Theme"
            value={form.theme}
            onChange={(v) => set('theme', v)}
          />
        </div>
      </Section>

      <Section title="Event details" description="Date, venue and hero copy.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date (display)"
            value={form.date}
            onChange={(v) => set('date', v)}
            placeholder="March 15, 2026"
          />
          <Field
            label="Venue"
            value={form.venue}
            onChange={(v) => set('venue', v)}
          />
        </div>
        <div className="space-y-2">
          <Label>Countdown target (ISO date)</Label>
          <Input
            type="datetime-local"
            value={form.countdownDate?.slice(0, 16) ?? ''}
            onChange={(e) =>
              set(
                'countdownDate',
                e.target.value ? new Date(e.target.value).toISOString() : '',
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Hero tagline</Label>
          <Textarea
            rows={2}
            value={form.heroTagline}
            onChange={(e) => set('heroTagline', e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium">Registration open</p>
            <p className="text-xs text-muted-foreground">
              When off, event registration is closed site-wide.
            </p>
          </div>
          <Switch
            checked={form.registrationOpen}
            onCheckedChange={(v) => set('registrationOpen', v)}
          />
        </div>
      </Section>

      <Section title="Contact" description="How attendees reach you.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Contact email"
            value={form.contactEmail}
            onChange={(v) => set('contactEmail', v)}
          />
          <Field
            label="Phone"
            value={form.phone}
            onChange={(v) => set('phone', v)}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Social links</Label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={addSocial}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
          {form.socials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No social links.</p>
          ) : (
            form.socials.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={s.label}
                  onChange={(e) => setSocial(i, { label: e.target.value })}
                  placeholder="Instagram"
                  className="sm:max-w-40"
                />
                <Input
                  value={s.url}
                  onChange={(e) => setSocial(i, { url: e.target.value })}
                  placeholder="https://…"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeSocial(i)}
                  aria-label="Remove social link"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={pending} className="gap-2">
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save changes
        </Button>
      </div>
    </div>
  )
}
