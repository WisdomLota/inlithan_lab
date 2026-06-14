import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { getMe, updateMe } from '../../api/users'

export default function AccountTab() {
  const { user, setUser } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe().then(res => {
      const u = res.data
      setName(u.name || '')
      setEmail(u.email || '')
      setAvatar(u.avatar || '')
      setGithubUsername(u.githubUsername || '')
    }).catch(err => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveProfile(e) {
    e.preventDefault()
    try {
      const res = await updateMe({ name })
      if (res.success) {
        localStorage.setItem('token', res.token)
        setUser(prev => ({ ...prev, name }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    }
  }

  if (loading) return <div className="tab-section"><h3 className="tab-heading">Account</h3><p className="settings-hint">Loading...</p></div>

  return (
    <div className="tab-section">
      <h3 className="tab-heading">Account</h3>

      <div className="avatar-section">
        {avatar ? (
          <img src={avatar} alt="avatar" className="avatar-circle" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="avatar-circle">
            {name ? name[0].toUpperCase() : 'U'}
          </div>
        )}
        <div>
          <p className="settings-hint">Avatar synced from your OAuth provider</p>
        </div>
      </div>

      <form onSubmit={handleSaveProfile}>
        <div className="settings-group">
          <label className="settings-label">Full name</label>
          <input
            className="settings-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="settings-group">
          <label className="settings-label">Email</label>
          <input
            className="settings-input"
            type="email"
            value={email}
            disabled
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
          <p className="settings-hint">Email is managed by your OAuth provider and cannot be changed here.</p>
        </div>

        <div className="settings-group">
          <label className="settings-label">Role</label>
          <div className="role-badge">
            {user?.role === 'teacher' ? 'Teacher' : 'Student'}
          </div>
        </div>

        {githubUsername && (
          <div className="settings-group">
            <label className="settings-label">GitHub</label>
            <div className="role-badge">@{githubUsername}</div>
          </div>
        )}

        <button type="submit" className="btn-save">
          {saved ? '✓ Saved!' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}