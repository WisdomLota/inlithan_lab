import { useState, useEffect } from 'react'
import { getLeaderboard, refreshMyScore } from '../api/scores'
import { useAuth } from '../context/useAuth'
import './Dashboard.css'

function Leaderboard() {
  const { user } = useAuth()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const res = await getLeaderboard()
      setScores(res.data || [])
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshMyScore()
      await load()
    } catch (err) {
      console.error('Failed to refresh score:', err)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className='page-body'>
      <div className='page-actions'>
        <button className='teacher-panel-btn' onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing...' : 'Refresh My Score'}
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#8C8D8F' }}>Loading leaderboard...</p>
      ) : scores.length === 0 ? (
        <p style={{ color: '#8C8D8F' }}>No scores yet. Click "Refresh My Score" to get started.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scores.map(s => (
            <div
              key={s.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 10,
                background: s.userId === user?.id ? '#143326' : '#1e2128',
                border: s.userId === user?.id ? '1px solid #00B764' : 'none',
              }}
            >
              <span style={{ color: '#00B764', fontWeight: 700, width: 28 }}>#{s.rank}</span>
              {s.avatar && <img src={s.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{s.name}</p>
                {s.githubUsername && (
                  <p style={{ color: '#8C8D8F', fontSize: 12 }}>
                    GitHub: {s.githubUsername} — {s.githubCommits} commits, {s.githubPRs} PRs, {s.githubRepos} repos
                  </p>
                )}
              </div>
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{s.totalScore}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Leaderboard