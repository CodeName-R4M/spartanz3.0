import { generateId, store } from './store'
import { toPublicUser, type ContactMessage, type EventItem, type PublicUser, type Registration, type RegistrationStatus, type User } from './types'

const copy = <T>(value: T): T => structuredClone(value)

export const repo = {
  async users(): Promise<PublicUser[]> {
    return store.users.map(toPublicUser).map(copy)
  },
  async findUserById(id: string): Promise<User | null> {
    return copy(store.users.find((user) => user.id === id) ?? null)
  },
  async findUserByEmail(email: string): Promise<User | null> {
    return copy(store.users.find((user) => user.email === email.trim().toLowerCase()) ?? null)
  },
  async createUser(input: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<PublicUser> {
    if (store.users.some((user) => user.email === input.email.trim().toLowerCase())) throw new Error('An account with this email already exists.')
    const user: User = { ...input, email: input.email.trim().toLowerCase(), id: generateId('usr'), role: 'participant', createdAt: new Date().toISOString() }
    store.users.push(user)
    return copy(toPublicUser(user))
  },
  async events(): Promise<EventItem[]> {
    return copy([...store.events].sort((a, b) => a.name.localeCompare(b.name)))
  },
  async findEvent(idOrSlug: string): Promise<EventItem | null> {
    return copy(store.events.find((event) => event.id === idOrSlug || event.slug === idOrSlug) ?? null)
  },
  async createEvent(input: Omit<EventItem, 'id' | 'createdAt'>): Promise<EventItem> {
    if (store.events.some((event) => event.slug === input.slug)) throw new Error('That event slug is already in use.')
    const event: EventItem = { ...input, id: generateId('evt'), createdAt: new Date().toISOString() }
    store.events.push(event)
    return copy(event)
  },
  async updateEvent(id: string, input: Partial<Omit<EventItem, 'id' | 'createdAt'>>): Promise<EventItem> {
    const index = store.events.findIndex((event) => event.id === id)
    if (index < 0) throw new Error('Event not found.')
    store.events[index] = { ...store.events[index], ...input }
    return copy(store.events[index])
  },
  async deleteEvent(id: string): Promise<void> {
    const index = store.events.findIndex((event) => event.id === id)
    if (index < 0) throw new Error('Event not found.')
    store.events.splice(index, 1)
  },
  async registrations(): Promise<Registration[]> {
    return copy([...store.registrations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },
  async registrationsForUser(userId: string): Promise<Registration[]> {
    return copy(store.registrations.filter((registration) => registration.userId === userId))
  },
  async createRegistration(input: Omit<Registration, 'id' | 'createdAt' | 'status'>): Promise<Registration> {
    if (store.registrations.some((registration) => registration.userId === input.userId && registration.eventId === input.eventId && registration.status !== 'cancelled')) throw new Error('You are already registered for this event.')
    const registration: Registration = { ...input, id: generateId('reg'), status: 'pending', createdAt: new Date().toISOString() }
    store.registrations.push(registration)
    return copy(registration)
  },
  async updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<Registration> {
    const registration = store.registrations.find((item) => item.id === id)
    if (!registration) throw new Error('Registration not found.')
    registration.status = status
    return copy(registration)
  },
  async messages(): Promise<ContactMessage[]> {
    return copy([...store.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
  },
  async createMessage(input: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<ContactMessage> {
    const message: ContactMessage = { ...input, id: generateId('msg'), read: false, createdAt: new Date().toISOString() }
    store.messages.push(message)
    return copy(message)
  },
  async markMessageRead(id: string): Promise<void> {
    const message = store.messages.find((item) => item.id === id)
    if (!message) throw new Error('Message not found.')
    message.read = true
  },
  async stats() {
    return { users: store.users.length, events: store.events.length, registrations: store.registrations.length, unreadMessages: store.messages.filter((message) => !message.read).length }
  },
}
