import { useState, useMemo } from 'react'
import './StudentListTemp.css'
import arrow from '../assets/arrow.svg'
import personIcon from '../assets/personIcon.svg'


const STUDENTS = [
  {
    id: 1,
    name: 'Yedil Beken',
    rank: 1,
    courses: 1,
    activities: 22,
    activityDetails: { quiz: 22, assignments: 22, activities: 22, researchPapers: 2 },
    courseDetails: ['Mobile Programming'],
    rankDetails: {
      commitsWeek: 8,
      commitsMonth: 21,
      commitsYear: 379,
      commitsAllTime: 2782,
      topLanguages: 'Solidity, JavaScript, C#',
    },
  },
  {
    id: 2,
    name: 'Konishua Sempai',
    rank: 3,
    courses: 2,
    activities: 3,
    activityDetails: { quiz: 3, assignments: 2, activities: 3, researchPapers: 1 },
    courseDetails: ['Web Development', 'Data Structures'],
    rankDetails: {
      commitsWeek: 2,
      commitsMonth: 9,
      commitsYear: 142,
      commitsAllTime: 980,
      topLanguages: 'Python, JavaScript',
    },
  },
  {
    id: 3,
    name: 'Victor Okafor',
    rank: 2,
    courses: 4,
    activities: 32,
    activityDetails: { quiz: 30, assignments: 28, activities: 32, researchPapers: 4 },
    courseDetails: ['Mobile Programming', 'Web Development', 'Machine Learning', 'Cloud Computing'],
    rankDetails: {
      commitsWeek: 12,
      commitsMonth: 38,
      commitsYear: 512,
      commitsAllTime: 3140,
      topLanguages: 'Java, Kotlin, Go',
    },
  },
]

const FILTERS = ['All', 'Rank', 'Courses', 'Activity']



function StudentRow({ student, expanded, onToggle }) {
  const { activityDetails: a, rankDetails: r } = student

  return (
    <div className="sl-card">
      <button className="sl-row" onClick={onToggle}>
        <span className="sl-avatar"><img src={personIcon} alt="Person" /></span>
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
            <span>{student.courseDetails.join(', ')}</span>
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
  const [filter, setFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(STUDENTS[0]?.id ?? null)

  const sortedStudents = useMemo(() => {
    const list = [...STUDENTS]
    if (filter === 'Rank') list.sort((a, b) => a.rank - b.rank)
    else if (filter === 'Activity') list.sort((a, b) => b.activities - a.activities)
    else if (filter === 'Courses') list.sort((a, b) => b.courses - a.courses)
    return list
  }, [filter])

  const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id))

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
            {f === 'Courses' && <span className="sl-filter-caret"> <img src={arrow} alt="Arrow" /> </span>}
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
