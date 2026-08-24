import { INITIAL_ADMIN_EMAIL, featuredEvents } from '@/lib/site-config'
import { hashPassword } from '@/lib/auth/password'
import type {
  ContactMessage,
  EventItem,
  Registration,
  User,
} from './types'

/**
 * TEMPORARY in-memory database.
 *
 * This seeds itself from lib/site-config.ts on first load and keeps data in
 * process memory. It resets on server restart / redeploy — that is expected
 * for the template phase. Swap lib/db/repo.ts for a real database when ready;
 * this file can then be deleted.
 *
 * A global singleton is used so data survives Next.js dev hot-reloads.
 */

type Store = {
  users: User[]
  events: EventItem[]
  registrations: Registration[]
  messages: ContactMessage[]
}

const longDescription =
  'Enter the arena and prove your worth. This event is part of the SPARTANZ 3.0 doomsday protocol — expect intense competition, sharp minds, and a fight to the finish. Full rules will be briefed on-site before the event begins.'

function seedEvents(): EventItem[] {
  const now = new Date().toISOString()
  return featuredEvents.map((event, index) => ({
    id: `evt_${index + 1}`,
    slug: event.slug,
    name: event.name,
    category: event.category,
    shortDescription: event.shortDescription,
    description: longDescription,
    date: event.date,
    venue: event.venue,
    teamSize: event.teamSize,
    fee: event.fee,
    prize: event.prize,
    rules: [
      'Carry a valid college ID card.',
      'Report 30 minutes before the event.',
      'Decisions of the judges are final.',
      'Any malpractice leads to disqualification.',
    ],
    coordinatorName: 'Event Coordinator',
    coordinatorPhone: '+91 00000 00000',
    featured: true,
    createdAt: now,
  }))
}

function seedStore(): Store {
  const now = new Date().toISOString()
  const admin: User = {
    id: 'usr_admin',
    name: 'Admin',
    email: INITIAL_ADMIN_EMAIL.toLowerCase(),
    phone: '+91 00000 00000',
    college: 'New Prince Shri Bhavani College of Engineering',
    // TEMPLATE default admin password — change after first login.
    passwordHash: hashPassword('spartanz-admin'),
    role: 'admin',
    createdAt: now,
  }

  return {
    users: [admin],
    events: seedEvents(),
    registrations: [],
    messages: [],
  }
}

const globalForStore = globalThis as unknown as { __spartanzStore?: Store }

export const store: Store = globalForStore.__spartanzStore ?? seedStore()

if (!globalForStore.__spartanzStore) {
  globalForStore.__spartanzStore = store
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
