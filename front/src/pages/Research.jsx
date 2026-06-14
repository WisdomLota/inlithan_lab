import { useState } from 'react'
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

const TOTAL_PAGES = 5

function getPageContent(page) {
  return [{ type: 'p', text: `Content for page ${page} of the research paper.` }]
}

function Research() {
  const [page, setPage] = useState(1)

  const goPrev = () => setPage(p => Math.max(1, p - 1))
  const goNext = () => setPage(p => Math.min(TOTAL_PAGES, p + 1))

  return (
    <div className="research-page">
      <div className="rp-card">
        <div className="rp-tabbar">
          <button className="rp-tab active">Research Paper</button>
        </div>

        <div className="rp-pagination">
          <button className="rp-arrow" disabled={page === 1} onClick={goPrev}>‹</button>
          <span className="rp-page-box">{page}</span>
          <span className="rp-of">of {TOTAL_PAGES}</span>
          <button className="rp-arrow" disabled={page === TOTAL_PAGES} onClick={goNext}>›</button>
        </div>

        <div className="rp-content">
          {renderBlocks(getPageContent(page))}
        </div>

        <div className="rp-footer">
          {page < TOTAL_PAGES && (
            <button className="rp-next" onClick={goNext}>Next</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Research
