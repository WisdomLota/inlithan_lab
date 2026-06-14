import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useCourses } from '../context/useCourses'
import { useActivities } from '../context/useActivities'
import { useAuth } from '../context/useAuth'
import { submitActivity } from '../api/activities'
import emptyIcon from '../assets/emptyIcon.png'
// import './ActivityDetail.css'

function ActivityDetail() {
  const { courseId, activityId } = useParams()
  const { courses } = useCourses()
  const { activities, refreshActivities } = useActivities()
  const { user } = useAuth()
  const isTeacher = user.role === 'teacher'

  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const course = courses.find(c => c.id === courseId)
  const activity = activities.find(a => a.id === activityId)

  if (!course || !activity) {
    return <div style={{ color: '#fff', padding: 24 }}>Activity not found</div>
  }

  const questions = Array.isArray(activity.questions) ? activity.questions : []

  // Check if this student already submitted
  const existingSubmission = activity.submissions?.find(
    s => (s.student?._id || s.student) === user.id
  )

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const orderedAnswers = questions.map((_, i) => answers[i] || '')
      const res = await submitActivity(activity.id, { answers: orderedAnswers })
      setResult(res.data)
      await refreshActivities()
    } catch (err) {
      console.error('Submit failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // TEACHER VIEW
  if (isTeacher) {
    return (
      <div className="activity-detail">
        <div className="ad-breadcrumb">
          <Link to="/courses">Courses</Link>
          <span className="ad-sep">›</span>
          <Link to={`/courses/${courseId}`}>{course.title}</Link>
          <span className="ad-sep">›</span>
          <span className="ad-current">{activity.type}</span>
        </div>

        <div className="ad-panel">
          <div className="ad-panel-header">
            <span className="ad-tab">{activity.type}</span>
          </div>
          <div className="ad-panel-body">
            <img src={emptyIcon} alt="" className="ad-logo" />
            <h2 className="ad-title">{activity.title}</h2>
            <p className="ad-meta">
              {activity.questionCount ?? questions.length} questions
              {activity.minutes && <><br />{activity.minutes} minutes</>}
              <br />
              {activity.submissions?.length || 0} submission(s)
            </p>
            <button className="ad-btn-solid">View Submissions</button>
          </div>
        </div>
      </div>
    )
  }

  // STUDENT VIEW - already submitted
  if (existingSubmission && !result) {
    return (
      <div className="activity-detail">
        <div className="ad-breadcrumb">
          <Link to="/courses">Courses</Link>
          <span className="ad-sep">›</span>
          <Link to={`/courses/${courseId}`}>{course.title}</Link>
          <span className="ad-sep">›</span>
          <span className="ad-current">{activity.type}</span>
        </div>
        <div className="ad-panel">
          <div className="ad-panel-body">
            <h2 className="ad-title">{activity.title}</h2>
            <p className="ad-meta">You already submitted this. Score: {existingSubmission.score}%</p>
          </div>
        </div>
      </div>
    )
  }

  // STUDENT VIEW - result after submit
  if (result) {
    return (
      <div className="activity-detail">
        <div className="ad-breadcrumb">
          <Link to="/courses">Courses</Link>
          <span className="ad-sep">›</span>
          <Link to={`/courses/${courseId}`}>{course.title}</Link>
          <span className="ad-sep">›</span>
          <span className="ad-current">{activity.type}</span>
        </div>
        <div className="ad-panel">
          <div className="ad-panel-body">
            <h2 className="ad-title">Submitted!</h2>
            <p className="ad-meta">
              You scored {result.score}% ({Math.round(result.score / 100 * result.total)} / {result.total} correct)
            </p>
            <Link to={`/courses/${courseId}`}>
              <button className="ad-btn-solid">Back to Course</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // STUDENT VIEW - taking the quiz
  return (
    <div className="activity-detail">
      <div className="ad-breadcrumb">
        <Link to="/courses">Courses</Link>
        <span className="ad-sep">›</span>
        <Link to={`/courses/${courseId}`}>{course.title}</Link>
        <span className="ad-sep">›</span>
        <span className="ad-current">{activity.type}</span>
      </div>

      <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ color: '#fff', marginBottom: 8 }}>{activity.title}</h2>
        <p style={{ color: '#8C8D8F', marginBottom: 24 }}>{questions.length} questions</p>

        {questions.length === 0 ? (
          <p style={{ color: '#8C8D8F' }}>No questions available for this activity.</p>
        ) : (
          questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 28, background: '#1e2128', borderRadius: 8, padding: 18 }}>
              <p style={{ color: '#fff', marginBottom: 12, fontSize: 14 }}>
                {i + 1}. {q.question}
              </p>
              {(q.options || []).map((opt, j) => (
                <label key={j} style={{ display: 'block', color: '#8C8D8F', fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={opt}
                    checked={answers[i] === opt}
                    onChange={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                    style={{ marginRight: 8 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ))
        )}

        {questions.length > 0 && (
          <button className="ad-btn-solid" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  )
}

export default ActivityDetail