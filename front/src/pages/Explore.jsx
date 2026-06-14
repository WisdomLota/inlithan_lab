import { useState } from 'react'
import { useCourses } from '../context/useCourses.js'
// import './Explore.css'
import { joinCourse } from '../api/courses'

function Explore() {
  const { exploreCourses, refreshCourses, refreshExplore, loading } = useCourses()
  const [modalCourse, setModalCourse] = useState(null)
  const [email, setEmail] = useState('')
  const [joining, setJoining] = useState(false)

  function openModal(course) {
    setModalCourse(course)
    setEmail('')
  }

  async function handleJoin() {
    if (!modalCourse) return
    setJoining(true)
    try {
      await joinCourse(modalCourse.id)
      await refreshCourses()
      await refreshExplore()
      setModalCourse(null)
    } catch (err) {
      console.error('Failed to join course:', err)
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="explore-page">

      {loading && <p style={{ color: '#8c8d8f', padding: 16 }}>Loading courses...</p>}
      {!loading && exploreCourses.length === 0 && (
        <p style={{ color: '#8c8d8f', padding: 16 }}>No courses available to join right now.</p>
      )}
      
      <div className="explore-cards-grid">
        {exploreCourses.map(course => (
          <div key={course.id} className="explore-card">
            <span className="explore-card-badge">{course.skillLevel}</span>
            <p className="explore-card-title">{course.title}</p>
            <p className="explore-card-university">{course.university}</p>
            <div className="explore-card-actions">
              <button className="btn-request" onClick={() => openModal(course)}>
                Request to Join
              </button>
              <button className="btn-preview">
                Preview Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalCourse && (
        <div className="modal-overlay" onClick={() => setModalCourse(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalCourse(null)}>×</button>
            <h3 className="modal-title">Join Course</h3>
            <p className="modal-desc">
              In order for you to join a course we must either the email from the
              school you are affiliated with or the professional email you would
              like to use
            </p>
            <input
              type="email"
              className="modal-email-input"
              placeholder="student Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className="btn-request" onClick={handleJoin} disabled={joining}>
              {joining ? 'Joining...' : 'Request to Join'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Explore
