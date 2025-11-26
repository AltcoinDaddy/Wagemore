interface AuthSession {
  user: {
    id: string
    name: string
    email: string
    username: string
    image?: string
    emailVerified: boolean
  } | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
}

const AUTH_STORAGE_KEY = 'wagermore_auth'
const REFRESH_TOKEN_KEY = 'wagermore_refresh_token'

export const authStorage = {
  // Get current session
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (!stored) return null

      const session: AuthSession = JSON.parse(stored)

      // Check if session has expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Error getting session:', error)
      this.clearSession()
      return null
    }
  },

  // Set session data
  setSession(session: AuthSession): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))

      // Store refresh token separately for security
      if (session.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
      }
    } catch (error) {
      console.error('Error setting session:', error)
    }
  },

  // Update session data
  updateSession(updates: Partial<AuthSession>): void {
    const currentSession = this.getSession()
    if (currentSession) {
      const updatedSession = { ...currentSession, ...updates }
      this.setSession(updatedSession)
    }
  },

  // Update user data only
  updateUser(user: AuthSession['user']): void {
    this.updateSession({ user })
  },

  // Update tokens
  updateTokens(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): void {
    const expiresAt = Date.now() + expiresIn * 1000
    this.updateSession({
      accessToken,
      refreshToken,
      expiresAt,
    })
  },

  // Get access token
  getAccessToken(): string | null {
    const session = this.getSession()
    return session?.accessToken || null
  },

  // Get refresh token
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error getting refresh token:', error)
      return null
    }
  },

  // Get user data
  getUser(): AuthSession['user'] | null {
    const session = this.getSession()
    return session?.user || null
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const session = this.getSession()
    return !!(session?.user && session?.accessToken)
  },

  // Check if token is expired or will expire soon (within 5 minutes)
  isTokenExpired(): boolean {
    const session = this.getSession()
    if (!session?.expiresAt) return true

    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
    return session.expiresAt <= fiveMinutesFromNow
  },

  // Clear session data
  clearSession(): void {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      localStorage.removeItem(REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  },

  // Subscribe to storage changes (for multi-tab sync)
  onStorageChange(callback: (session: AuthSession | null) => void): () => void {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_STORAGE_KEY) {
        const session = this.getSession()
        callback(session)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  },

  // Initialize session from stored data
  initialize(): AuthSession | null {
    return this.getSession()
  },
}

// Export types
export type { AuthSession }
