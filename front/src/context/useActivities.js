import { useContext } from 'react'
import { ActivitiesContext } from './ActivitiesContext'

export function useActivities() {
  const ctx = useContext(ActivitiesContext)
  if (!ctx) throw new Error('useActivities must be used inside ActivitiesProvider')
  return ctx
}