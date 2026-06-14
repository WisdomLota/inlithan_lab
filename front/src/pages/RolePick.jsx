import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
// import './RolePick.css'

const ROLES = [
  {
    value: 'student',
    label: 'Student',
    tagline: 'Learn at your own pace',
    description:
      "As a student gives you access to personalized learning paths, instant explanations, auto-generated practice activities, and progress insights that help you understand exactly where you're improving and where you need support. You'll complete tasks, track your growth, and get smarter recommendations the more you learn.",
  },
  {
    value: 'teacher',
    label: 'Tutor',
    tagline: 'Turn AI into your teaching assistant.',
    description:
      "As a teacher unlocks tools for creating lessons, generating activities, monitoring student progress, and understanding learning patterns across your class. You'll be able to assign tasks, review analytics, and use AI-powered insights to support every learner more effectively — without adding to your workload.",
  },
]

function RolePick() {
  const navigate = useNavigate()
  const { setRole } = useAuth()
  const [selected, setSelected] = useState('teacher')

  const handleDone = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: selected })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('token', data.token)
        setRole(selected)
        navigate('/dashboard')
      }
    } catch (err) {
      console.error('Failed to set role:', err)
    }
  }

  return (
    <div className="role-pick">
      <h1 className="role-pick-title">Which role suits your needs best?</h1>

      <div className="role-cards">
        {ROLES.map((role) => {
          const isSelected = selected === role.value
          return (
            <button
              type="button"
              key={role.value}
              className={`role-card${isSelected ? ' selected' : ''}`}
              onClick={() => setSelected(role.value)}
            >
              <div className="role-card-top">
                <span className={`role-radio${isSelected ? ' checked' : ''}`} />
                <span className="role-name">{role.label}</span>
              </div>
              <p className="role-tagline">{role.tagline}</p>
              <p className="role-description">{role.description}</p>
            </button>
          )
        })}
      </div>

      <button className="role-done" onClick={handleDone}>
        Done
      </button>
    </div>
  )
}

export default RolePick
