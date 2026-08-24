'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { registerForEvent } from '@/app/actions/public'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import type { EventItem } from '@/lib/types'

interface RegisterFormProps {
  events: EventItem[]
}

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Final Year', 'Other']

export function RegisterForm({ events }: RegisterFormProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselect = searchParams.get('event')

  const [eventSlug, setEventSlug] = useState<string>(
    preselect && events.some((e) => e.slug === preselect)
      ? preselect
      : events[0]?.slug ?? '',
  )
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const selectedEvent = useMemo(
    () => events.find((e) => e.slug === eventSlug) ?? null,
    [eventSlug, events],
  )

  const isTeamEvent = (selectedEvent?.teamSize.max ?? 1) > 1
  const maxMembers = (selectedEvent?.teamSize.max ?? 1) - 1

  function addMember() {
    if (members.length < maxMembers) setMembers((m) => [...m, ''])
  }
  function updateMember(i: number, val: string) {
    setMembers((m) => m.map((x, idx) => (idx === i ? val : x)))
  }
  function removeMember(i: number) {
    setMembers((m) => m.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedEvent) return
    setSubmitting(true)
    const res = await registerForEvent({
      eventId: selectedEvent.id,
      fullName,
      email,
      phone,
      college,
      department,
      year,
      teamName: teamName || undefined,
      members: members
        .map((m) => m.trim())
        .filter(Boolean)
        .map((name) => ({ name })),
    })
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
      toast.success('Registration confirmed!')
    } else {
      toast.error(res.error ?? 'Something went wrong.')
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center font-mono text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <h2 className="font-sans text-2xl font-bold text-foreground">
          Sign in to register
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          You need to be signed in to secure your place in the arena. Sign in
          to continue.
        </p>
        <div className="mt-6 flex justify-center">
          <SignInDialog>
            <Button size="lg">Sign in to continue</Button>
          </SignInDialog>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="rounded-lg border border-primary/40 bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto size-14 text-primary" />
        <h2 className="mt-6 font-sans text-3xl font-extrabold uppercase text-foreground">
          You&apos;re in
        </h2>
        <p className="mx-auto mt-3 max-w-md text-pretty text-muted-foreground">
          Your registration for{' '}
          <span className="font-bold text-foreground">
            {selectedEvent?.name}
          </span>{' '}
          is confirmed. Check your dashboard for details.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => router.push('/dashboard')} size="lg">
            Go to dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent"
            onClick={() => {
              setDone(false)
              setMembers([])
              setTeamName('')
            }}
          >
            Register for another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="event">Event</Label>
          <Select value={eventSlug} onValueChange={setEventSlug}>
            <SelectTrigger id="event">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.slug}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedEvent && (
            <p className="font-mono text-xs text-muted-foreground">
              {selectedEvent.teamSize.min === selectedEvent.teamSize.max
                ? selectedEvent.teamSize.min === 1
                  ? 'Solo entry'
                  : `Teams of exactly ${selectedEvent.teamSize.min}`
                : `Teams of ${selectedEvent.teamSize.min}-${selectedEvent.teamSize.max} members`}
              {selectedEvent.registrationFee > 0 &&
                ` • Fee ₹${selectedEvent.registrationFee}`}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@college.edu"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+91 …"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="college">College</Label>
            <Input
              id="college"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              required
              placeholder="Your college"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              placeholder="e.g. CSE"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Year of study</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isTeamEvent && (
          <div className="rounded-lg border border-border bg-background/40 p-5">
            <div className="grid gap-2">
              <Label htmlFor="teamName">Team name</Label>
              <Input
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Optional team name"
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <Label>Team members (besides you)</Label>
                <span className="font-mono text-xs text-muted-foreground">
                  {members.length}/{maxMembers}
                </span>
              </div>
              <div className="mt-3 grid gap-3">
                {members.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={m}
                      onChange={(e) => updateMember(i, e.target.value)}
                      placeholder={`Member ${i + 2} name`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0 bg-transparent"
                      onClick={() => removeMember(i)}
                      aria-label="Remove member"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {members.length < maxMembers && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-primary hover:text-primary"
                  onClick={addMember}
                >
                  <Plus className="mr-1 size-4" />
                  Add member
                </Button>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={submitting || !year}
          className="w-full"
        >
          {submitting ? 'Registering…' : 'Confirm registration'}
        </Button>
      </div>
    </form>
  )
}
