import { useState, useEffect } from 'react'
import { getAllStudents } from '../api/courses'

function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllStudents()
      .then(res => setStudents(res.data || []))
      .catch(err => console.error('Failed to load students:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className='page-body'>
      {loading ? (
        <p style={{ color: '#8C8D8F' }}>Loading students...</p>
      ) : students.length === 0 ? (
        <p style={{ color: '#8C8D8F' }}>No students enrolled in your courses yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {students.map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 10,
                background: '#1e2128',
              }}
            >
              {s.avatar ? (
                <img src={s.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2a2d35' }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{s.name}</p>
                <p style={{ color: '#8C8D8F', fontSize: 12 }}>{s.email}</p>
                <p style={{ color: '#8C8D8F', fontSize: 12 }}>
                  Enrolled in: {s.courses.join(', ')}
                </p>
              </div>
              {s.githubUsername && (
                <span style={{ color: '#00B764', fontSize: 12 }}>
                  GitHub: {s.githubUsername}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudentList