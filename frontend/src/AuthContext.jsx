import { createContext, useContext, useState, useEffect } from 'react'
import { apiGetMe, apiLogin, apiRegister, apiLogout, apiUpdateProfile } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, check for stored token and hydrate user
  useEffect(() => {
    const token = localStorage.getItem('is_token')
    if (token) {
      apiGetMe()
        .then(data => setUser(data.user))
        .catch(() => { localStorage.removeItem('is_token'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    localStorage.setItem('is_token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (body) => {
    const data = await apiRegister(body)
    localStorage.setItem('is_token', data.token)
    setUser(data.user)
    return data.user
  }

  const updateProfile = async (body) => {
    const data = await apiUpdateProfile(body)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await apiLogout() } catch {}
    localStorage.removeItem('is_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
