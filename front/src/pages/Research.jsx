import { useState, useEffect } from 'react'
import { getCurrentResearchPaper } from '../api/research'
import './Research.css'

function renderBlocks(blocks) {
  return blocks.map((block, i) => {
    if (block.type === 'p') return <p key={i} className="rp-p">{block.text}</p>
    if (block.type === 'h') return <h3 key={i} className="rp-h">{block.text}</h3>
    if (block.type === 'ul') return (
      <ul key={i} className="rp-ul">
        {block.items.map((item, j) => <li key={j}>{item}</li>)}
      </ul>
    )
    return null
  })
}

function Research() {
  const [paper, setPaper] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentResearchPaper()
      .then(res => setPaper(res.data))
      .catch(err => console.error('Failed to load research paper:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="research-page"><p style={{ color: '#8C8D8F', padding: 24 }}>Loading...</p></div>
  if (!paper) return <div className="research-page"><p style={{ color: '#8C8D8F', padding: 24 }}>No research paper available yet.</p></div>

  const totalPages = paper.pages.length
  const goPrev = () => setPage(p => Math.max(1, p - 1))
  const goNext = () => setPage(p => Math.min(totalPages, p + 1))

  return (
    <div className="research-page">
      <div className="rp-card">
        <div className="rp-tabbar">
          <button className="rp-tab active">{paper.title}</button>
        </div>

        <div className="rp-pagination">
          <button className="rp-arrow" disabled={page === 1} onClick={goPrev}>‹</button>
          <span className="rp-page-box">{page}</span>
          <span className="rp-of">of {totalPages}</span>
          <button className="rp-arrow" disabled={page === totalPages} onClick={goNext}>›</button>
        </div>

        <div className="rp-content">
          {renderBlocks(paper.pages[page - 1] || [])}
        </div>

        <div className="rp-footer">
          {paper.sourceUrl && (
            <a href={paper.sourceUrl} target="_blank" rel="noreferrer" className="rp-next">Source ↗</a>
          )}
          {page < totalPages && (
            <button className="rp-next" onClick={goNext} style={{ marginLeft: 16 }}>Next</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Research