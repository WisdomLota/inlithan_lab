import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActivities } from '../context/useActivities'
import { useCourses } from '../context/useCourses'
import activityIcon from '../assets/activities-w.svg'
import logo from '../assets/emptyIcon.png'
import './Footer.css'

const DAY_MS = 1000 * 60 * 60 * 24

// temp
// const MOCK_ACTIVITIES = [
//   { _id: 'mock-1', code: 'ECC 501', type: 'Quiz', dueDate: new Date(Date.now() + 1 * DAY_MS) },
//   { _id: 'mock-2', code: 'ECC 501', type: 'Assignment', dueDate: new Date(Date.now() + 3 * DAY_MS) },
//   { _id: 'mock-3', code: 'MTH 204', type: 'Quiz', dueDate: new Date(Date.now() + 5 * DAY_MS) },
//   { _id: 'mock-4', code: 'PHY 110', type: 'Notes', dueDate: new Date(Date.now() + 7 * DAY_MS) },
// ]

function daysUntilDue(activity) {
  if (!activity.dueDate) return Infinity
  return Math.ceil((new Date(activity.dueDate) - Date.now()) / DAY_MS)
}

function dueLabel(days) {
  if (days === Infinity) return 'No due date'
  if (days <= 0) return 'Due today'
  if (days === 1) return 'Due in 1 day'
  return `Due in ${days} days`
}

function Footer() {
  const { activities } = useActivities()
  console.log('Footer activities:', activities) 
  const { courses } = useCourses()
  const navigate = useNavigate()

  // sort by deadline and keep only four.
  const upcoming = useMemo(() => {
    return activities
      .map(a => ({ ...a, dueInDays: daysUntilDue(a) }))
      .sort((a, b) => a.dueInDays - b.dueInDays)
      .slice(0, 4)
  }, [activities])

  function codeFor(act) {
    const id = act.courseId?._id || act.courseId
    const course = courses.find(c => (c._id || c.id) === id)
    return course?.title || act.code || 'Course'
  }

  if (upcoming.length === 0) {
    return (
      <footer className="footer footer--empty">
        <img src={logo} alt="" className="footer-empty-logo" />
      </footer>
    )
  }

  return (
    <footer className="footer">
      {upcoming.map((act, i) => (
        <div
          key={act.id || act._id}
          className={`footer-card ${i === 0 ? 'footer-card--soon' : ''}`}
          onClick={() => navigate(`/courses/${act.courseId?._id || act.courseId}/activity/${act.id || act._id}`)}
        >
          <img src={activityIcon} alt="" className="footer-card-icon" />
          <div className="footer-card-text">
            <span className="footer-card-code">{codeFor(act)}</span>
            <span className="footer-card-sub">{act.type}</span>
          </div>
          <span className="footer-card-badge">{dueLabel(act.dueInDays)}</span>
        </div>
      ))}
    </footer>
  )
}

export default Footer
