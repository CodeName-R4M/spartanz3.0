/**
 * SPARTANZ 3.0 — central template configuration.
 *
 * These are TEMPORARY placeholder values. Replace them with real data later
 * (or wire them up to the database / admin settings table).
 *
 * The initial admin is seeded from INITIAL_ADMIN_EMAIL. It defaults to the
 * requested admin account below until you connect auth + database.
 */

export const INITIAL_ADMIN_EMAIL =
  process.env.INITIAL_ADMIN_EMAIL ?? 'sriramisno1@gmail.com'

export const siteConfig = {
  event: 'SPARTANZ 3.0',
  subtitle: 'DEPARTMENT SYMPOSIUM',
  theme: 'AVENGERS: DOOMSDAY INSPIRED',
  department: 'CSE — CYBER SECURITY',
  college: 'New Prince Shri Bhavani College of Engineering',
  club: 'RootSec Club',

  // TEMPLATE — replace with the real symposium date (ISO string).
  eventDate: '2026-03-14T09:00:00',
  eventDateLabel: '14 MARCH 2026',
  venue: 'Main Auditorium, NPSBCOE',

  contactEmail: 'spartanz@example.com',
  contactPhone: '+91 00000 00000',

  socials: {
    instagram: '#',
    linkedin: '#',
    github: '#',
    youtube: '#',
  },
} as const
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/team', label: 'Team' },
  { href: '/contact', label: 'Contact' },
] as const
export type EventCategory = 'TECHNICAL' | 'NON-TECHNICAL'

export type EventPreview = {
  slug: string
  name: string
  category: EventCategory
  shortDescription: string
  date: string
  venue: string
  teamSize: string
  fee: string
  prize: string
}

// TEMPLATE events — replace with data from the database later.
export const featuredEvents: EventPreview[] = [
  {
    slug: 'code-storm',
    name: 'Code Storm',
    category: 'TECHNICAL',
    shortDescription: 'Competitive coding gauntlet under a ticking doomsday clock.',
    date: '14 MAR',
    venue: 'Lab A-Block',
    teamSize: 'Solo',
    fee: '₹150',
    prize: '₹10,000',
  },
  {
    slug: 'ctf-breach',
    name: 'Breach: CTF',
    category: 'TECHNICAL',
    shortDescription: 'Capture-the-flag warfare. Exploit, escalate, dominate.',
    date: '14 MAR',
    venue: 'Cyber Lab',
    teamSize: '2 Members',
    fee: '₹200',
    prize: '₹15,000',
  },
  {
    slug: 'paper-vortex',
    name: 'Paper Vortex',
    category: 'TECHNICAL',
    shortDescription: 'Present research that could reshape the future.',
    date: '14 MAR',
    venue: 'Seminar Hall',
    teamSize: '2 Members',
    fee: '₹150',
    prize: '₹8,000',
  },
  {
    slug: 'valorant-endgame',
    name: 'Endgame Arena',
    category: 'NON-TECHNICAL',
    shortDescription: '5v5 tactical showdown for the last team standing.',
    date: '15 MAR',
    venue: 'Gaming Zone',
    teamSize: '5 Members',
    fee: '₹250',
    prize: '₹12,000',
  },
  {
    slug: 'meme-multiverse',
    name: 'Meme Multiverse',
    category: 'NON-TECHNICAL',
    shortDescription: 'Bend reality with the sharpest memes in the room.',
    date: '15 MAR',
    venue: 'Open Stage',
    teamSize: 'Solo',
    fee: '₹100',
    prize: '₹5,000',
  },
  {
    slug: 'quiz-infinity',
    name: 'Infinity Quiz',
    category: 'NON-TECHNICAL',
    shortDescription: 'Tech, cinema and chaos — prove your mind is unbreakable.',
    date: '15 MAR',
    venue: 'Seminar Hall',
    teamSize: '2 Members',
    fee: '₹120',
    prize: '₹6,000',
  },
]

export const eventStats = [
  { label: 'Events', value: 12, suffix: '+' },
  { label: 'Prize Pool', value: 75, suffix: 'K+' },
  { label: 'Participants', value: 800, suffix: '+' },
  { label: 'Colleges', value: 20, suffix: '+' },
]

export const timeline = [
  { time: '08:30', title: 'Registration & Check-in', desc: 'Collect your battle pass and ID.' },
  { time: '09:30', title: 'Inauguration', desc: 'The doomsday protocol begins.' },
  { time: '10:30', title: 'Technical Events', desc: 'Code, breach and conquer.' },
  { time: '13:00', title: 'Non-Technical Events', desc: 'Games, quizzes and chaos.' },
  { time: '16:00', title: 'Finals & Showdown', desc: 'Only the strongest remain.' },
  { time: '17:30', title: 'Valedictory', desc: 'Crown the champions.' },
]

export const teamPreview = [
  { name: 'Faculty Lead', role: 'Convenor', category: 'Faculty' },
  { name: 'Student Head', role: 'Organizing Lead', category: 'Organizing' },
  { name: 'Tech Lead', role: 'Technical Head', category: 'Technical' },
  { name: 'Design Lead', role: 'Creative Head', category: 'Design' },
]
