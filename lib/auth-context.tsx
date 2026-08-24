'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMe, signInWithGoogle, signOut } from '@/app/actions/auth'
import type { User } from '@/lib/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (input: {
    name: string
    email: string
    avatarUrl?: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const me = await getMe()
      setUser(me)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const signIn = useCallback(
    async (input: { name: string; email: string; avatarUrl?: string }) => {
      const res = await signInWithGoogle(input)
      if (res.ok && res.user) setUser(res.user)
      return { ok: res.ok, error: res.error }
    },
    [],
  )

  const logout = useCallback(async () => {
    await signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
