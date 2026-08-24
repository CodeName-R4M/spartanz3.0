'use client'

import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitContact } from '@/app/actions/public'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await submitContact({ name, email, subject, message })
    setSubmitting(false)
    if (res.ok) {
      setDone(true)
      toast.success('Message sent — we will get back to you soon.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } else {
      toast.error(res.error ?? 'Could not send your message.')
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-primary/40 bg-card p-10 text-center">
        <CheckCircle2 className="mx-auto size-12 text-primary" />
        <h3 className="mt-5 font-display text-2xl font-bold uppercase text-foreground">
          Transmission received
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-pretty text-muted-foreground">
          Thanks for reaching out. The RootSec team will respond to your message
          shortly.
        </p>
        <Button
          variant="outline"
          className="mt-6 bg-transparent"
          onClick={() => setDone(false)}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="c-name">Name</Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              placeholder="Your name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="c-email">Email</Label>
            <Input
              id="c-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-subject">Subject</Label>
          <Input
            id="c-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            maxLength={160}
            placeholder="What is this about?"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="c-message">Message</Label>
          <Textarea
            id="c-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={4000}
            rows={6}
            placeholder="Your message…"
          />
        </div>
        <Button type="submit" size="lg" disabled={submitting} className="gap-2">
          {submitting ? (
            'Sending…'
          ) : (
            <>
              <Send className="size-4" />
              Send message
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
