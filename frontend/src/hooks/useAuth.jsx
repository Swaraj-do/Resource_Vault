import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rv_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rv_token')
    if (token) {
      api.get('/api/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('rv_token'); localStorage.removeItem('rv_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('rv_token', res.data.token)
    localStorage.setItem('rv_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }

  const register = async (email, password) => {
    const res = await api.post('/api/auth/register', { email, password })
    localStorage.setItem('rv_token', res.data.token)
    localStorage.setItem('rv_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.removeItem('rv_token'); localStorage.removeItem('rv_user'); setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
