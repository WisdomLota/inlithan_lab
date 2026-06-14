import { useState, useEffect, useMemo } from 'react'
import './StudentListTemp.css'
import arrow from '../assets/arrow.svg'
import personIcon from '../assets/personIcon.svg'
import { getAllStudentsDetailed } from '../api/courses'
import { useAuth } from '../context/useAuth'
import { Navigate } from 'react-router-dom'

const FILTERS = ['All', 'Rank', 'Courses', 'Activity']

function StudentRow({ student, expanded, onToggle }) {
  const { activityDetails: a, rankDetails: r } = student

  return (
    <div className="sl-card">
      <button className="sl-row" onClick={onToggle}>
        <span className="sl-avatar">
          {student.avatar ? <img src={student.avatar} alt="" /> : <img src={personIcon} alt="Person" />}
        </span>
        <span className="sl-name">{student.name}</span>
        <span className="sl-stat">Rank: {student.rank}</span>
        <span className="sl-stat">Courses: {student.courses}</span>
        <span className="sl-stat">Activities: {student.activities}</span>
        <span className={`sl-chevron ${expanded ? 'up' : ''}`}><img src={arrow} alt="Expand" /></span>
      </button>

      {expanded && (
        <div className="sl-details">
          <p className="sl-detail-title">Activity Details:</p>
          <div className="sl-detail-grid">
            <span>Quiz {a.quiz}</span>
            <span>Assignments {a.assignments}</span>
            <span>Activities {a.activities}</span>
            <span>Research papers {a.researchPapers}</span>
          </div>

          <p className="sl-detail-title">Course Details:</p>
          <div className="sl-detail-grid">
            <span>{student.courseDetails.join(', ') || 'None'}</span>
          </div>

          <p className="sl-detail-title">Rank Details:</p>
          <div className="sl-detail-grid">
            <span>Commits this week: {r.commitsWeek}</span>
            <span>Commits this month: {r.commitsMonth}</span>
            <span>Commits this year: {r.commitsYear}</span>
            <span>All time commits: {r.commitsAllTime}</span>
          </div>
          <div className="sl-detail-grid">
            <span className="sl-lang"><span>Top programming language:</span><span>{r.topLanguages}</span></span>
            <span>Rank: {student.rank}</span>
          </div>

          <div className="sl-details-footer">
            <button className="sl-review-btn">Review Student</button>
          </div>
        </div>
      )}
    </div>
  )
}

function StudentListTemp() {
  const { user } = useAuth()
  if (user?.role !== 'teacher') return <Navigate to="/dashboard" />
  const [filter, setFilter] = useState('All')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    getAllStudentsDetailed()
      .then(res => {
        const data = res.data || []
        setStudents(data)
        if (data.length > 0) setExpandedId(data[0].id)
      })
      .catch(err => console.error('Failed to load student list:', err))
      .finally(() => setLoading(false))
  }, [])

  const sortedStudents = useMemo(() => {
    const list = [...students]
    if (filter === 'Rank') list.sort((a, b) => a.rank - b.rank)
    else if (filter === 'Activity') list.sort((a, b) => b.activities - a.activities)
    else if (filter === 'Courses') list.sort((a, b) => b.courses - a.courses)
    return list
  }, [students, filter])

  const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id))

  if (loading) {
    return <div className="page-body sl-page"><p style={{ color: '#8C8D8F' }}>Loading students...</p></div>
  }

  if (students.length === 0) {
    return <div className="page-body sl-page"><p style={{ color: '#8C8D8F' }}>No students enrolled in your courses yet.</p></div>
  }

  return (
    <div className="page-body sl-page">
      <div className="sl-filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={"sl-filter " + (filter === f ? 'active' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="sl-list">
        {sortedStudents.map((s) => (
          <StudentRow
            key={s.id}
            student={s}
            expanded={expandedId === s.id}
            onToggle={() => toggle(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default StudentListTemp