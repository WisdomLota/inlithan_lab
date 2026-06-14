import { useState, useEffect } from 'react'
import { getPendingRequests, acceptRequest, rejectRequest } from '../api/courses'

function NewStudentPopup({ onClose }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await getPendingRequests()
      setRequests(res.data || [])
    } catch (err) {
      console.error('Failed to load requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function accept(req) {
    try {
      await acceptRequest(req.courseId, req.studentId)
      setRequests(prev => prev.filter(r => r.id !== req.id))
    } catch (err) {
      console.error('Accept failed:', err)
    }
  }

  async function reject(req) {
    try {
      await rejectRequest(req.courseId, req.studentId)
      setRequests(prev => prev.filter(r => r.id !== req.id))
    } catch (err) {
      console.error('Reject failed:', err)
    }
  }

  async function acceptAll() {
    for (const req of requests) {
      await acceptRequest(req.courseId, req.studentId)
    }
    setRequests([])
  }

  return (
    <div className='new-student-popup'>
      <div className='new-student-popup-header'>
        <span>New Student List</span>
        <button className='new-student-popup-close' onClick={onClose}>✕</button>
      </div>

      <div className='new-student-popup-toolbar'>
        <span className='new-student-count'>Students ({requests.length})</span>
        {requests.length > 0 && <button className='accept-link' onClick={acceptAll}>Accept All</button>}
      </div>

      {loading ? (
        <p className='new-student-empty'>Loading...</p>
      ) : requests.length === 0 ? (
        <p className='new-student-empty'>No new student requests.</p>
      ) : (
        requests.map((request) => (
          <div className='new-student-row' key={request.id}>
            <span className='new-student-avatar' />
            <div className='new-student-info'>
              <span className='new-student-email'>{request.studentName || request.studentEmail}</span>
              <span className='new-student-course'>{request.courseTitle}</span>
            </div>
            <button className='accept-link' onClick={() => accept(request)}>Accept</button>
            <button className='accept-link' style={{ color: '#e05555' }} onClick={() => reject(request)}>Reject</button>
          </div>
        ))
      )}
    </div>
  )
}

export default NewStudentPopup