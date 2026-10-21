import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, TOKEN_KEY } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setReady(true)
      return
    }
    api
      .get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setReady(true))
  }, [])

  const value = useMemo(() => {
    const store = ({ token, user }) => {
      localStorage.setItem(TOKEN_KEY, token)
      setUser(user)
      return user
    }
    return {
      user,
      ready,
      isAdmin: user?.role === 'ADMIN',
      login: async (email, password) => store((await api.post('/auth/login', { email, password })).data),
      register: async (payload) => store((await api.post('/auth/register', payload)).data),
      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        setUser(null)
      },
    }
  }, [user, ready])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
