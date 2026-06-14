import { useState, useEffect } from 'react'
import { CoursesContext } from './CoursesContext'
import { useAuth } from './useAuth'
import { getCourses, getExploreCourses } from '../api/courses'
import icon from '../assets/courses.png'

export function CoursesProvider({ children }) {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [exploreCourses, setExploreCourses] = useState([])
  const [loading, setLoading] = useState(true)

  async function refreshCourses() {
    if (!user) return
    try {
      const res = await getCourses()
      const mapped = (res.data || []).map(c => ({ ...c, id: c._id, icon: c.icon || icon }))
      setCourses(mapped)
    } catch (err) {
      console.error("Failed to load courses:", err)
    }
  }

  async function refreshExplore() {
    if (!user) return
    try {
      const res = await getExploreCourses()
      const mapped = (res.data || []).map(c => ({ ...c, id: c._id, icon: c.icon || icon }))
      setExploreCourses(mapped)
    } catch (err) {
      console.error("Failed to load explore courses:", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([refreshCourses(), refreshExplore()]).finally(() => setLoading(false))
  }, [user])

  return (
    <CoursesContext.Provider value={{ courses, setCourses, exploreCourses, loading, refreshCourses, refreshExplore }}>
      {children}
    </CoursesContext.Provider>
  )
}

export default CoursesProvider