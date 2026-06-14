import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { useActivities } from '../context/useActivities'
import { getSessions, getSession, createSession, deleteSession, sendMessage, updateSessionTitle } from '../api/labs'
import { generateActivity } from '../api/activities'
import './AILabs.css'
import { useCourses } from '../context/useCourses'

function AILabs() {
  const { user } = useAuth()
  const { refreshActivities } = useActivities()
  const location = useLocation()
  const navigate = useNavigate()
  const [view, setView] = useState('history')
  const [mode, setMode] = useState('buddy')
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [generatingActivity, setGeneratingActivity] = useState(false)

  const { courses } = useCourses()

  const [attachedFile, setAttachedFile] = useState(null)
  const fileInputRef = useRef(null)

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

  useEffect(() => {
    const activityRequest = location.state?.activityRequest
    if (!activityRequest) return

    async function runGeneration() {
      setView('chat')
      setGeneratingActivity(true)

      // create a session to host this conversation
      const sessionRes = await createSession('tutor')
      setCurrentSession(sessionRes.data)

      const course = courses.find(c => (c._id || c.id) === activityRequest.courseId)
      const title = `${activityRequest.activityType} - ${course?.title || 'Course'}`
      await updateSessionTitle(sessionRes.data._id, title)
      setCurrentSession(prev => ({ ...prev, title }))
      setMessages([{ role: 'ai', text: `Generating your ${activityRequest.activityType.toLowerCase()} based on the course content. This may take a moment...` }])

      try {
        const res = await generateActivity(
          {
            courseId: activityRequest.courseId,
            activityType: activityRequest.activityType,
            questionCount: activityRequest.questionCount,
            timeBased: activityRequest.timeBased,
            minutes: activityRequest.minutes,
            questionType: activityRequest.questionType,
          },
          activityRequest.pdfFile
        )

        await refreshActivities()

        setMessages(prev => [...prev, {
          role: 'ai',
          text: `Done! I've created "${res.data.title}" with ${res.data.questions.length} questions, due ${new Date(res.data.dueDate).toLocaleDateString()}. You can find it in your Activities list.`
        }])
      } catch (err) {
        console.error('Activity generation failed:', err)
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I ran into an issue generating the activity. Please try again.' }])
      } finally {
        setGeneratingActivity(false)
        // clear nav state so it doesn't re-trigger on back/refresh
        navigate(location.pathname, { replace: true, state: {} })
      }
    }

    runGeneration()
  }, [location.state])

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
    if ((!text && !attachedFile) || !currentSession) return

    setMessages(prev => [...prev, { role: 'user', text: text || `(Attached: ${attachedFile?.name})`, attachment: attachedFile?.name }])
    setInput('')
    const fileToSend = attachedFile
    setAttachedFile(null)
    setLoading(true)

    try {
      const res = await sendMessage(currentSession._id, text, fileToSend)
      setMessages(res.data.messages)
      await loadSessions()
    } catch (err) {
      console.error('Send failed:', err)
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setAttachedFile(file)
    }
    e.target.value = null
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
                {msg.attachment && <div className="lab-message-attachment">📎 {msg.attachment}</div>}
                {msg.text}
              </div>
            ))}
            {(loading || generatingActivity) && (
              <div className="lab-message lab-message-ai">
                <span className="lab-typing">Thinking
                 <span></span><span></span><span></span>
                </span>
              </div>
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
          <button className="lab-attach-btn" onClick={() => fileInputRef.current.click()}>
            {attachedFile ? `📎 ${attachedFile.name}` : '+ Attach'}
          </button>
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          <button className="lab-send-btn" onClick={handleSend} disabled={loading}>
            {loading ? '...' : '↑'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AILabs