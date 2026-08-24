/**
 * Domain types for the SPARTANZ backend.
 *
 * These map 1:1 to future database tables (users, events, registrations,
 * contact_messages). When you connect a real database, keep these types and
 * only reimplement lib/db/repo.ts.
 */

export type UserRole = 'admin' | 'participant'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  college: string
  /** scrypt hash in the form `salt:hash` (never store plaintext) */
  passwordHash: string
  role: UserRole
  createdAt: string
}

export type EventCategory = 'TECHNICAL' | 'NON-TECHNICAL'

export type EventItem = {
  id: string
  slug: string
  name: string
  category: EventCategory
  shortDescription: string
  description: string
  date: string
  venue: string
  teamSize: string
  fee: string
  prize: string
  rules: string[]
  coordinatorName: string
  coordinatorPhone: string
  featured: boolean
  createdAt: string
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled'

export type Registration = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  college: string
  eventId: string
  eventName: string
  teamName: string | null
  teammates: string[]
  status: RegistrationStatus
  createdAt: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

/** Public shape of a user (never leak passwordHash to the client). */
export type PublicUser = Omit<User, 'passwordHash'>

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user
  return rest
}
