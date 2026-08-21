import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getUserProfile } from '../api/api.js'

/**
 * Holds the signed-in parent's profile for every dashboard page.
 *
 * In the original, js/components/dNavMenu.js fetched the profile to render the
 * header and each page script fetched it again for its own content. Fetching
 * once here and sharing it removes that duplicate request; the rendered result
 * is the same.
 */

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const profile = await getUserProfile()
    setUser(profile)
    return profile
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const profile = await getUserProfile()
      if (!cancelled) {
        setUser(profile)
        setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo(
    () => ({ user, setUser, loading, refreshUser }),
    [user, loading, refreshUser],
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used inside a UserProvider')
  }
  return context
}
