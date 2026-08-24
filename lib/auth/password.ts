import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

/**
 * Password hashing using Node's built-in scrypt (no external dependency).
 * Stored format: `<saltHex>:<hashHex>`.
 *
 * If you later move to Supabase Auth / another provider, these helpers are
 * only used inside the repository + auth actions and can be removed.
 */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const hashBuffer = Buffer.from(hash, 'hex')
  const candidate = scryptSync(password, salt, 64)
  if (hashBuffer.length !== candidate.length) return false
  return timingSafeEqual(hashBuffer, candidate)
}
