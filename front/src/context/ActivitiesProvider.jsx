import { useState, useEffect } from 'react'
import { ActivitiesContext } from './ActivitiesContext'
import { useAuth } from './useAuth'
import { getActivities } from '../api/activities'

export function ActivitiesProvider({ children }) {
  const { user } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  async function refreshActivities() {
    if (!user) return
    try {
      const res = await getActivities()
      const mapped = (res.data || []).map(a => ({ ...a, id: a._id, courseId: a.courseId }))
      setActivities(mapped)
    } catch (err) {
      console.error("Failed to load activities:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    refreshActivities().finally(() => setLoading(false))
  }, [user])

  return (
    <ActivitiesContext.Provider value={{ activities, setActivities, loading, refreshActivities }}>
      {children}
    </ActivitiesContext.Provider>
  )
}

export default ActivitiesProvider