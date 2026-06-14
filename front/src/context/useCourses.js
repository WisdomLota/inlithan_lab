import { useContext } from 'react'
import { CoursesContext } from './CoursesContext'

export function useCourses() {
  return useContext(CoursesContext)
}