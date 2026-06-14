import { useState } from 'react'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      return JSON.parse(atob(base64))
    } catch {
      return null
    }
  })

  const setRole = (role) => setUser((prev) => ({ ...prev, role }))

  return (
    <AuthContext.Provider value={{ user, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}