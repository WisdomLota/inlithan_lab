import { useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth'
import { getSessions, getSession, createSession, deleteSession, sendMessage } from '../api/labs'
import './AILabs.css'

function AILabs() {
  const { user } = useAuth()
  const [view, setView] = useState('history')
  const [mode, setMode] = useState('buddy')
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)

  async function loadSessions() {
    try {
      const res = await getSessions()
      setSessions(res.data || [])
    } catch (err) {
      console.error('Failed to load sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => { loadSessions() }, [])

  async function openSession(id) {
    try {
      const res = await getSession(id)
      setCurrentSession(res.data)
      setMessages(res.data.messages || [])
      setMode(res.data.mode)
      setView('chat')
    } catch (err) {
      console.error('Failed to open session:', err)
    }
  }

  async function openChat() {
    try {
      const res = await createSession(mode)
      setCurrentSession(res.data)
      setMessages([])
      setView('chat')
      await loadSessions()
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    try {
      await deleteSession(id)
      await loadSessions()
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || !currentSession) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await sendMessage(currentSession._id, text)
      setMessages(res.data.messages)
      await loadSessions()
    } catch (err) {
      console.error('Send failed:', err)
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  if (view === 'history') {
    return (
      <div className="lab-page">
        <div className="lab-history-header">
          <h2 className="lab-history-title">Lab History</h2>
          <button className="btn-new-session" onClick={openChat}>
            + Start New Lab Session
          </button>
        </div>

        <div className="lab-session-list">
          {loadingSessions ? (
            <p style={{ color: '#8c8d8f', padding: 12 }}>Loading...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: '#8c8d8f', padding: 12 }}>No sessions yet. Start one above.</p>
          ) : (
            sessions.map(session => (
              <div key={session._id} className="lab-session-item" onClick={() => openSession(session._id)}>
                <div className="lab-session-icon" />
                <span className="lab-session-name">{session.title}</span>
                <span className="lab-session-date">{new Date(session.updatedAt).toLocaleDateString()}</span>
                <button className="lab-session-menu" onClick={(e) => handleDelete(session._id, e)}>✕</button>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="lab-chat-page">
      <div className="lab-chat-back" onClick={() => { setView('history'); loadSessions() }}>
        ‹ AI Lab
      </div>

      <div className="lab-chat-body">
        {messages.length === 0 ? (
          <div className="lab-chat-welcome">
            <h2 className="lab-welcome-greeting">
              Good Afternoon, {user?.name || 'User'}
            </h2>
            <p className="lab-welcome-sub">
              Need help with <strong>any course?</strong>
            </p>
            <div className="lab-mode-toggle">
              <button
                className={`lab-mode-btn ${mode === 'tutor' ? 'active' : ''}`}
                onClick={() => setMode('tutor')}
              >
                Tutor Mode
              </button>
              <button
                className={`lab-mode-btn ${mode === 'buddy' ? 'active' : ''}`}
                onClick={() => setMode('buddy')}
              >
                Study Buddy Mode
              </button>
            </div>
          </div>
        ) : (
          <div className="lab-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`lab-message lab-message-${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="lab-message lab-message-ai">Thinking...</div>
            )}
          </div>
        )}
      </div>

      <div className="lab-chat-input-area">
        <input
          className="lab-chat-input"
          placeholder="Ask whatever you are ready.."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <div className="lab-chat-input-actions">
          <button className="lab-attach-btn">+ Attach</button>
          <button className="lab-send-btn" onClick={handleSend} disabled={loading}>
            {loading ? '...' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AILabs