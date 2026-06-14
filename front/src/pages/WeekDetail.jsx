import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCourses } from '../context/useCourses'
import './WeekDetail.css'

function renderBlocks(blocks) {
  return blocks.map((block, i) => {
    if (block.type === 'p') return <p key={i} className="wd-p">{block.text}</p>
    if (block.type === 'h') return <h3 key={i} className="wd-h">{block.text}</h3>
    if (block.type === 'ul') return (
      <ul key={i} className="wd-ul">
        {block.items.map((item, j) => <li key={j}>{item}</li>)}
      </ul>
    )
    if (block.type === 'ol') return (
      <ol key={i} className="wd-ol">
        {block.items.map((item, j) => <li key={j}>{item}</li>)}
      </ol>
    )
    return null
  })
}

function WeekDetail() {
  const { courseId, weekId } = useParams()
  const { courses } = useCourses()

  const [activeTab, setActiveTab] = useState('lessonNotes')
  const [lessonPage, setLessonPage] = useState(1)
  const [flashPage, setFlashPage] = useState(1)
  const [isFlipped, setIsFlipped] = useState(false)
  const [summaryView, setSummaryView] = useState('lesson')

  const course = courses.find(c => c.id === courseId)
  const week = course?.weeks.find(w => w.id === weekId || w._id === weekId)

  if (!course || !week) return <div style={{ color: '#fff', padding: 24 }}>Week not found</div>

  const tabs = [
    { key: 'lessonNotes', label: 'Lesson Notes' },
    ...(week.hasCode ? [{ key: 'code', label: 'Code' }] : []),
    { key: 'summary', label: 'Summary' },
    { key: 'flashCards', label: 'Flash Cards' },
    { key: 'notes', label: 'Notes' },
  ]

  const lessonPages = week.lessonNotes || []
  const totalLessonPages = lessonPages.length
  const currentLessonContent = lessonPages[lessonPage - 1] || []

  const flashCards = week.flashCards || []
  const totalFlashCards = flashCards.length
  const currentCard = flashCards[flashPage - 1]

  return (
    <div className="week-detail">
      <div className="wd-breadcrumb">
        <Link to="/courses">Courses</Link>
        <span className="wd-sep">›</span>
        <Link to={`/courses/${courseId}`}>{course.title}</Link>
        <span className="wd-sep">›</span>
        <span className="wd-current">Week {week.number}: {week.title}</span>
      </div>

      <div className="wd-tabs-container">
        <div className="wd-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`wd-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wd-content">

        {/* Lesson Notes */}
        {activeTab === 'lessonNotes' && (
          <div className="wd-lesson">
            {totalLessonPages > 0 && (
              <div className="wd-pagination">
                <button className="wd-arrow" disabled={lessonPage === 1} onClick={() => setLessonPage(p => p - 1)}>‹</button>
                <span className="wd-page-box">{lessonPage}</span>
                <span className="wd-of">of {totalLessonPages}</span>
                <button className="wd-arrow" disabled={lessonPage === totalLessonPages} onClick={() => setLessonPage(p => p + 1)}>›</button>
              </div>
            )}
            <div className="wd-lesson-content">
              {renderBlocks(currentLessonContent)}
            </div>
            <div className="wd-lesson-nav">
              <span>
                {lessonPage > 1 && (
                  <button className="wd-nav-btn" onClick={() => setLessonPage(p => p - 1)}>Prev</button>
                )}
              </span>
              <span>
                {lessonPage < totalLessonPages && (
                  <button className="wd-nav-btn" onClick={() => setLessonPage(p => p + 1)}>Next</button>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Summary */}
        {activeTab === 'summary' && (
          <div className="wd-summary">
            <div className="wd-toggle">
              <span className={`wd-toggle-label${summaryView === 'lesson' ? ' active' : ''}`}>Lesson</span>
              <button
                className="wd-toggle-track"
                onClick={() => setSummaryView(v => v === 'lesson' ? 'page' : 'lesson')}
              >
                <span className={`wd-toggle-dot${summaryView === 'page' ? ' right' : ''}`} />
              </button>
              <span className={`wd-toggle-label${summaryView === 'page' ? ' active' : ''}`}>Page</span>
            </div>
            <div className="wd-summary-content">
              {renderBlocks(summaryView === 'lesson' ? (week.lessonSummary?.lesson || []) : (week.lessonSummary?.page || []))}
            </div>
          </div>
        )}

        {/* Flash Cards */}
        {activeTab === 'flashCards' && (
          <div className="wd-flashcards">
            {totalFlashCards > 0 && (
              <div className="wd-pagination">
                <button
                  className="wd-arrow"
                  disabled={flashPage === 1}
                  onClick={() => { setFlashPage(p => p - 1); setIsFlipped(false) }}
                >‹</button>
                <span className="wd-page-box">{flashPage}</span>
                <span className="wd-of">of {totalFlashCards}</span>
                <button
                  className="wd-arrow"
                  disabled={flashPage === totalFlashCards}
                  onClick={() => { setFlashPage(p => p + 1); setIsFlipped(false) }}
                >›</button>
              </div>
            )}
            {currentCard && (
              <>
                <div className="wd-card">
                  <span className="wd-card-label">{isFlipped ? 'Answer:' : 'Question:'}</span>
                  <p className="wd-card-text">{isFlipped ? currentCard.answer : currentCard.question}</p>
                </div>
                <button className="wd-flip" onClick={() => setIsFlipped(f => !f)}>Flip</button>
              </>
            )}
          </div>
        )}

        {/* Notes */}
        {activeTab === 'notes' && (
          <div className="wd-notes">
            <textarea className="wd-notes-area" placeholder="Take your notes here..." />
          </div>
        )}

        {/* Code */}
        {activeTab === 'code' && (
          <div className="wd-code">
            <input className="wd-code-input" type="text" placeholder="Git Hub Repo Link" />
          </div>
        )}

      </div>
    </div>
  )
}

export default WeekDetail
