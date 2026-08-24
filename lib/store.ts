import 'server-only'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import type {
  AuditLog,
  ContactMessage,
  EventCategory,
  EventItem,
  Registration,
  SiteSettings,
  TeamMember,
  User,
} from './types'
import {
  SEED_CATEGORIES,
  SEED_EVENTS,
  SEED_SETTINGS,
  SEED_TEAM,
} from './seed'

// ---------------------------------------------------------------------------
// Mock persistent data layer for SPARTANZ 3.0.
//
// This stands in for Supabase PostgreSQL while integration is deferred.
// Data is persisted to a JSON file on disk so admin CRUD, registrations,
// and role changes survive across requests during development.
//
// SWAP TO SUPABASE: replace the functions in lib/data.ts with Supabase
// queries. This file and its shape mirror the intended schema exactly.
// ---------------------------------------------------------------------------

interface DBShape {
  users: User[]
  categories: EventCategory[]
  events: EventItem[]
  registrations: Registration[]
  team: TeamMember[]
  messages: ContactMessage[]
  audit: AuditLog[]
  settings: SiteSettings
}

const DB_PATH = path.join(os.tmpdir(), 'spartanz-db.json')

function initialDB(): DBShape {
  return {
    users: [],
    categories: SEED_CATEGORIES,
    events: SEED_EVENTS,
    registrations: [],
    team: SEED_TEAM,
    messages: [],
    audit: [],
    settings: SEED_SETTINGS,
  }
}

let cache: DBShape | null = null

async function load(): Promise<DBShape> {
  if (cache) return cache
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8')
    cache = JSON.parse(raw) as DBShape
  } catch {
    cache = initialDB()
    await persist()
  }
  return cache!
}

async function persist(): Promise<void> {
  if (!cache) return
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(cache), 'utf8')
  } catch {
    // best-effort persistence; cache still holds latest state in-process
  }
}

export function uid(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

// ---- Generic accessors ----
export async function db(): Promise<DBShape> {
  return load()
}

export async function commit(): Promise<void> {
  await persist()
}

// ---- Users ----
export async function getUsers() {
  return (await load()).users
}

export async function findUserByEmail(email: string) {
  const d = await load()
  return d.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export async function upsertUser(user: User) {
  const d = await load()
  const idx = d.users.findIndex((u) => u.id === user.id)
  if (idx >= 0) d.users[idx] = user
  else d.users.push(user)
  await persist()
  return user
}

export async function setUserRole(id: string, role: User['role']) {
  const d = await load()
  const u = d.users.find((x) => x.id === id)
  if (u) {
    u.role = role
    await persist()
  }
  return u
}

// ---- Categories ----
export async function getCategories() {
  return (await load()).categories.sort(
    (a, b) => a.displayOrder - b.displayOrder,
  )
}

export async function saveCategory(cat: EventCategory) {
  const d = await load()
  const idx = d.categories.findIndex((c) => c.id === cat.id)
  if (idx >= 0) d.categories[idx] = cat
  else d.categories.push(cat)
  await persist()
  return cat
}

export async function deleteCategory(id: string) {
  const d = await load()
  d.categories = d.categories.filter((c) => c.id !== id)
  await persist()
}

// ---- Events ----
export async function getEvents() {
  return (await load()).events.sort((a, b) => a.displayOrder - b.displayOrder)
}

export async function saveEvent(ev: EventItem) {
  const d = await load()
  const idx = d.events.findIndex((e) => e.id === ev.id)
  if (idx >= 0) d.events[idx] = ev
  else d.events.push(ev)
  await persist()
  return ev
}

export async function deleteEvent(id: string) {
  const d = await load()
  d.events = d.events.filter((e) => e.id !== id)
  await persist()
}

// ---- Registrations ----
export async function getRegistrations() {
  return (await load()).registrations
}

export async function addRegistration(reg: Registration) {
  const d = await load()
  d.registrations.push(reg)
  await persist()
  return reg
}

export async function updateRegistration(reg: Registration) {
  const d = await load()
  const idx = d.registrations.findIndex((r) => r.id === reg.id)
  if (idx >= 0) {
    d.registrations[idx] = reg
    await persist()
  }
  return reg
}

// ---- Team ----
export async function getTeam() {
  return (await load()).team.sort((a, b) => a.displayOrder - b.displayOrder)
}

export async function saveTeamMember(m: TeamMember) {
  const d = await load()
  const idx = d.team.findIndex((t) => t.id === m.id)
  if (idx >= 0) d.team[idx] = m
  else d.team.push(m)
  await persist()
  return m
}

export async function deleteTeamMember(id: string) {
  const d = await load()
  d.team = d.team.filter((t) => t.id !== id)
  await persist()
}

// ---- Messages ----
export async function getMessages() {
  return (await load()).messages
}

export async function addMessage(m: ContactMessage) {
  const d = await load()
  d.messages.push(m)
  await persist()
  return m
}

// ---- Audit ----
export async function getAudit() {
  return (await load()).audit
}

export async function addAudit(a: AuditLog) {
  const d = await load()
  d.audit.unshift(a)
  await persist()
  return a
}

// ---- Settings ----
export async function getSettings() {
  return (await load()).settings
}

export async function saveSettings(s: SiteSettings) {
  const d = await load()
  d.settings = s
  await persist()
  return s
}
