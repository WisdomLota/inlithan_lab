import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCourses } from '../context/useCourses'
import { useActivities } from '../context/useActivities'
import { useAuth } from '../context/useAuth'
import './CourseDetail.css'
import { useState, useRef } from 'react'
import { uploadCoursePdf } from '../api/courses'
import { uploadCourseIcon } from '../api/courses'
import { updateWeek } from '../api/courses'
import { recheckWeek } from '../api/courses'
import { searchStudents, addStudentToCourse } from '../api/courses'

function CourseDetail() {
  const { courseId } = useParams()
  const { courses } = useCourses()
  const { activities } = useActivities()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [uploading, setUploading] = useState(false)
  const [outdatedFlags, setOutdatedFlags] = useState([])
  const fileInputRef = useRef(null)

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadCoursePdf(course.id, file)
      if (res.success) {
        setOutdatedFlags(res.outdatedFlags || [])
        window.location.reload()
      }
    } catch (err) {
      console.error('Upload failed:', err)
      alert(err.response?.data?.error || 'PDF processing failed. Try a shorter document.')
    } finally {
      setUploading(false)
    }
  }

  const [uploadingIcon, setUploadingIcon] = useState(false)
  const iconInputRef = useRef(null)
  
  const handleIconUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingIcon(true)
    try {
      await uploadCourseIcon(course.id, file)
      window.location.reload()
    } catch (err) {
      console.error('Icon upload failed:', err)
    } finally {
      setUploadingIcon(false)
    }
  }

  const [editingWeek, setEditingWeek] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingWeek, setSavingWeek] = useState(false)

  function openEdit(week) {
    setEditingWeek(week)
    setEditTitle(week.title)
    setEditDescription(week.description)
  }

  async function saveWeekEdit() {
    setSavingWeek(true)
    try {
      await updateWeek(course.id, editingWeek._id, { title: editTitle, description: editDescription })
      window.location.reload()
    } catch (err) {
      console.error('Failed to update week:', err)
    } finally {
      setSavingWeek(false)
    }
  }

  const [checkingWeek, setCheckingWeek] = useState(null)
  const [weekFlags, setWeekFlags] = useState({})

  async function handleRecheck(week) {
    setCheckingWeek(week._id)
    try {
      const res = await recheckWeek(course.id, week._id)
      setWeekFlags(prev => ({ ...prev, [week._id]: res.data }))
    } catch (err) {
      console.error('Recheck failed:', err)
      setWeekFlags(prev => ({ ...prev, [week._id]: { error: err.response?.data?.error || 'AI service unavailable. Please try again later.' } }))
    } finally {
      setCheckingWeek(null)
    }
  }

  const [showAddStudent, setShowAddStudent] = useState(false)
  const [studentQuery, setStudentQuery] = useState('')
  const [studentResults, setStudentResults] = useState([])
  const [searching, setSearching] = useState(false)
  
  async function handleStudentSearch(q) {
    setStudentQuery(q)
    if (!q.trim()) { setStudentResults([]); return }
    setSearching(true)
    try {
      const res = await searchStudents(q)
      setStudentResults(res.data || [])
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setSearching(false)
    }
  }
  
  async function handleAddStudent(studentId) {
    try {
      await addStudentToCourse(course.id, studentId)
      setStudentResults(prev => prev.filter(s => s._id !== studentId))
    } catch (err) {
      console.error('Add student failed:', err)
    }
  }

  const isTeacher = user.role === 'teacher'

  const course = courses.find(c => c.id === courseId)

  if (!course) return <div style={{ color: '#fff', padding: 24 }}>Course not found</div>

  const courseActivities = activities.filter(a => 
    (a.courseId?._id || a.courseId) === course.id
  )

  const sortedWeeks = [...course.weeks].sort((a, b) => {
    if (a.number === course.currentWeek) return -1
    if (b.number === course.currentWeek) return 1
    if (a.number > course.currentWeek && b.number > course.currentWeek) return a.number - b.number
    if (a.number > course.currentWeek) return -1
    if (b.number > course.currentWeek) return 1
    return a.number - b.number
  })

  return (
    <div className="course-detail">
      <div className="breadcrumb">
        <Link to="/courses">Courses</Link>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{course.title}</span>
      </div>

      {isTeacher && (
        <div style={{ padding: '0 24px 16px' }}>
          <button
            className="week-action-btn"
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? 'Generating week from PDF...' : '+ Upload Course Material (PDF)'}
          </button>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handlePdfUpload}
          />

          <button
            className="week-action-btn"
            style={{ marginLeft: 12 }}
            onClick={() => iconInputRef.current.click()}
            disabled={uploadingIcon}
          >
            {uploadingIcon ? 'Uploading icon...' : '+ Set Course Icon'}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={iconInputRef}
            style={{ display: 'none' }}
            onChange={handleIconUpload}
          />
          <button
            className="week-action-btn"
            style={{ marginLeft: 12 }}
            onClick={() => setShowAddStudent(true)}
          >
            + Add Student
          </button>
          {outdatedFlags.length > 0 && (
            <div style={{ marginTop: 12, padding: 12, border: '1px dashed #e05555', borderRadius: 6, color: '#e05555', fontSize: 13 }}>
              <strong>AI flagged outdated content:</strong>
              <ul>
                {outdatedFlags.map((flag, i) => <li key={i}>{flag}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="cd-section-header">
        <h2 className="cd-section-title">Course Activities</h2>
        <span className="see-more">See More ›</span>
      </div>
      <div className="activity-cards">
        {courseActivities.map(activity => (
          <div
            key={activity.id}
            className="activity-card"
            onClick={() => navigate(`/courses/${courseId}/activity/${activity.id}`)}
          >
            <div className="activity-type">{activity.type}</div>
            <div className="activity-course-name">{activity.title}</div>
            <div className="activity-meta">All {activity.total} &nbsp;&nbsp; {activity.questionCount ?? (Array.isArray(activity.questions) ? activity.questions.length : activity.questions)} questions</div>
            <div className="activity-grid-icon">⊞</div>
          </div>
        ))}
      </div>

      <div className="curriculum-section">
        <h2 className="cd-section-title" style={{ marginBottom: 14 }}>Curriculum</h2>
        {sortedWeeks.map(week => {
          const isCurrent = week.number === course.currentWeek
          const isPast = week.number < course.currentWeek

          return (
            <div key={week._id} className="week-item">
              <div
                className={`week-header${isCurrent ? ' current' : isPast ? ' past' : ''}`}
                onClick={() => navigate(`/courses/${courseId}/week/${week._id}`)}
              >
                <span className="week-title-text">
                  <span className="week-num">Week {week.number}:</span>
                  {week.title}
                </span>
                <span className="week-chevron">⌄</span>
              </div>
              {isCurrent && (
                <div className="week-content">
                  <p className="week-description">{week.description}</p>
                  {isTeacher ? (
                    <div className="week-actions">
                      <button
                        className="week-action-btn"
                        onClick={() => navigate(`/courses/${courseId}/week/${week._id}`)}
                      >
                        View
                      </button>
                      <button className="week-action-btn" onClick={() => openEdit(week)}>Edit</button>
                      <button className="week-action-btn" onClick={() => handleRecheck(week)} disabled={checkingWeek === week._id}>
                        {checkingWeek === week._id ? 'Checking...' : 'Check for Outdated Content'}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="resume-btn"
                      onClick={() => navigate(`/courses/${courseId}/week/${week._id}`)}
                    >
                      Resume
                    </button>
                  )}

                  {weekFlags[week._id] && (
                    <div style={{ marginTop: 12, padding: 12, border: '1px dashed', borderColor: weekFlags[week._id].error ? '#e05555' : (weekFlags[week._id].isUpToDate ? '#00B764' : '#e05555'), borderRadius: 6, color: weekFlags[week._id].error ? '#e05555' : (weekFlags[week._id].isUpToDate ? '#00B764' : '#e05555'), fontSize: 13 }}>
                      {weekFlags[week._id].error ? (
                        <strong>⚠ {weekFlags[week._id].error}</strong>
                      ) : weekFlags[week._id].isUpToDate ? (
                        <strong>✓ Content appears up to date.</strong>
                      ) : (
                        <>
                          <strong>AI flagged outdated content:</strong>
                          <ul>
                            {(weekFlags[week._id].outdatedFlags || []).map((flag, i) => (
                              <li key={i}>{typeof flag === 'string' ? flag : (flag.text || JSON.stringify(flag))}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {course.about && (
        <div className="about-section">
          <div className="about-title">About This Course</div>
          <p className="about-text">{course.about}</p>
          {course.aboutPoints.length > 0 && (
            <>
              <p className="about-text">Students will learn how to:</p>
              <ul className="about-list">
                {course.aboutPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </>
          )}
          {course.aboutClosing && <p className="about-text">{course.aboutClosing}</p>}
        </div>
      )}

      {editingWeek && (
        <div className="popup-overlay" onClick={() => setEditingWeek(null)}>
          <div className="create-course-popup" onClick={e => e.stopPropagation()}>
            <div className="create-course-popup-header">
              <span>Edit Week</span>
              <button className="new-student-popup-close" onClick={() => setEditingWeek(null)}>✕</button>
            </div>
            <input
              type="text"
              className="create-course-input"
              placeholder="Week title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
            <textarea
              className="create-course-input"
              placeholder="Week description"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
            <button className="btn-join create-course-submit" onClick={saveWeekEdit} disabled={savingWeek}>
              {savingWeek ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="popup-overlay" onClick={() => setShowAddStudent(false)}>
          <div className="create-course-popup" onClick={e => e.stopPropagation()}>
            <div className="create-course-popup-header">
              <span>Add Student</span>
              <button className="new-student-popup-close" onClick={() => setShowAddStudent(false)}>✕</button>
            </div>
            <input
              type="text"
              className="create-course-input"
              placeholder="Search by name or email"
              value={studentQuery}
              onChange={e => handleStudentSearch(e.target.value)}
            />
            {searching && <p className="settings-hint">Searching...</p>}
            {studentResults.map(s => (
              <div key={s._id} className="new-student-row">
                <span className="new-student-avatar" />
                <div className="new-student-info">
                  <span className="new-student-email">{s.name}</span>
                  <span className="new-student-course">{s.email}</span>
                </div>
                <button className="accept-link" onClick={() => handleAddStudent(s._id)}>Add</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetail
