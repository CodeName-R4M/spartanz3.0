/**
 * SPARTANZ 3.0 — configurable defaults.
 * ORGANISERS: every value here is overridable from /admin/settings once the
 * database is connected. These are only the fallback defaults.
 */
export const siteConfig = {
  symposium: "SPARTANZ 3.0",
  subtitle: "Department Symposium",
  theme: "Avengers: Doomsday Inspired",
  college: "New Prince Shri Bhavani College of Engineering",
  department: "CSE — Cyber Security",
  club: "RootSec Club",
  tagline: "The end of one world is the beginning of another.",
  heroLine:
    "A one-day cinematic symposium where cyber security students face the collapse — and rebuild what comes next.",

  // CONFIGURABLE: event date, venue, countdown target
  eventDate: "2026-03-14",
  eventDateLabel: "14 March 2026",
  countdownTarget: "2026-03-14T09:00:00+05:30",
  venue: "Main Auditorium, New Prince Shri Bhavani College of Engineering",
  venueShort: "Main Auditorium Block",
  city: "Gowrivakkam, Chennai",
  mapsQuery: "New Prince Shri Bhavani College of Engineering, Gowrivakkam, Chennai",

  // CONFIGURABLE: contact details
  contactEmail: "spartanz@npsbcollege.edu.in",
  contactPhone: "+91 90000 00000",
  registrationOpen: true,

  socials: {
    instagram: "https://instagram.com/",
    linkedin: "https://linkedin.com/",
    github: "https://github.com/",
    youtube: "https://youtube.com/",
  },

  // CONFIGURABLE: day-of run sheet shown on the home page
  schedule: [
    { time: "08:00", title: "Registration Desk Opens", detail: "Report at the Main Auditorium foyer with your college ID and confirmation code." },
    { time: "09:00", title: "Inauguration & Keynote", detail: "Welcome address by the Head of Department, followed by the RootSec keynote." },
    { time: "09:30", title: "Technical Round 1", detail: "Code Doomsday, Breach Protocol and Forensic Gauntlet begin in their assigned labs." },
    { time: "11:00", title: "Non-Technical Slot", detail: "Paper Storm, Meme Infinity and Shadow Auction run in parallel across seminar halls." },
    { time: "13:00", title: "Lunch Break", detail: "Provided for all registered participants at the college canteen." },
    { time: "14:00", title: "Technical Round 2 & Finals", detail: "Web Siege, Debug Multiverse and Cine Cipher finals, judged live." },
    { time: "16:00", title: "Endgame Arena", detail: "The cross-event finale — top scorers from every track compete for the overall title." },
    { time: "17:30", title: "Valedictory & Prize Distribution", detail: "Results, cash prizes and certificates for every finalist." },
  ],

  coordinators: [
    { name: "Dr. A. Ramesh", role: "Head of Department, CSE — Cyber Security", phone: "+91 90000 00001" },
    { name: "Prof. K. Divya", role: "Staff Coordinator, RootSec Club", phone: "+91 90000 00002" },
    { name: "Aravind S", role: "Student Convenor, SPARTANZ 3.0", phone: "+91 90000 00003" },
  ],
} as const

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/about", label: "About" },
  { href: "/teams", label: "Teams" },
  { href: "/contact", label: "Contact" },
] as const

export const TEAM_CATEGORIES = [
  "Faculty Coordinators",
  "Organizing Committee",
  "Event Coordinators",
  "Technical Team",
  "Design Team",
  "Media Team",
  "Hospitality Team",
  "Registration Team",
] as const

export const REGISTRATION_STATUSES = ["REGISTERED", "CONFIRMED", "CANCELLED", "ATTENDED"] as const

export const YEARS = ["I Year", "II Year", "III Year", "IV Year", "PG / Other"] as const
