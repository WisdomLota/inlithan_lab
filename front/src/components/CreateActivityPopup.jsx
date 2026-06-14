import { useRef, useState } from 'react'
import activityIcon from '../assets/activities-g.svg'
import { useCourses } from '../context/useCourses'
import { useActivities } from '../context/useActivities'
import { createActivity } from '../api/activities'

function RadioGroup({ name, options, value, onChange }) {
  return (
    <div className='activity-radio-group'>
      {options.map((option) => (
        <label
          key={option}
          className={`activity-radio${value === option ? ' selected' : ''}`}
        >
          <input
            type='radio'
            name={name}
            value={option}
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option}
        </label>
      ))}
    </div>
  )
}

function CreateActivityPopup({ onClose, onCreate }) {
  const { courses } = useCourses()
  const { refreshActivities } = useActivities()
  const fileInputRef = useRef(null)

  const [course, setCourse] = useState(courses[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [activityType, setActivityType] = useState('Assignment')
  const [questionCount, setQuestionCount] = useState('')
  const [timeBased, setTimeBased] = useState('No')
  const [minutes, setMinutes] = useState('')
  const [questionType, setQuestionType] = useState('Theory')
  const [usePdf, setUsePdf] = useState('No')
  const [pdfFile, setPdfFile] = useState(null)
  const [topicPrompt, setTopicPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!course || !title.trim() || courses.length === 0) return
    setLoading(true)
    try {
      await createActivity({
        courseId: course,
        title,
        type: activityType,
        questionCount: Number(questionCount) || 0,
        timeBased,
        minutes: Number(minutes) || undefined,
        questionType,
        topicPrompt: topicPrompt || title,
      })
      await refreshActivities()
      onCreate()
    } catch (err) {
      console.error('Failed to create activity:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='popup-overlay' onClick={onClose}>
      <div className='create-activity-popup' onClick={(e) => e.stopPropagation()}>
        <div className='create-course-popup-header'>
          <span>Activity Creation</span>
          <button className='new-student-popup-close' onClick={onClose}>✕</button>
        </div>

        <span className='activity-field-label'>Course:</span>
        <select
          className='activity-select'
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          {courses.length === 0 && <option value=''>No courses yet</option>}
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>

        <span className='activity-field-label'>Title:</span>
        <input
          type='text'
          className='create-course-input'
          placeholder='Activity Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <span className='activity-field-label'>Activity Type:</span>
        <RadioGroup
          name='activityType'
          options={['Quiz', 'Assignment']}
          value={activityType}
          onChange={setActivityType}
        />

        <span className='activity-field-label'>Topic / Prompt for AI:</span>
        <input
          type='text'
          className='create-course-input'
          placeholder="e.g. Newton's laws of motion"
          value={topicPrompt}
          onChange={(e) => setTopicPrompt(e.target.value)}
        />

        <span className='activity-field-label'>Number of Questions:</span>
        <input
          type='number'
          className='create-course-input'
          placeholder='Number of Questions'
          value={questionCount}
          onChange={(e) => setQuestionCount(e.target.value)}
        />

        <span className='activity-field-label'>Time Based:</span>
        <RadioGroup
          name='timeBased'
          options={['Yes', 'No']}
          value={timeBased}
          onChange={setTimeBased}
        />

        {timeBased === 'Yes' && (
          <input
            type='number'
            className='create-course-input'
            placeholder='Minutes'
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
          />
        )}

        <span className='activity-field-label'>Question Type:</span>
        <RadioGroup
          name='questionType'
          options={['Multiple Choice', 'Theory', 'Mixed']}
          value={questionType}
          onChange={setQuestionType}
        />

        <span className='activity-field-label'>Use PDF:</span>
        <RadioGroup
          name='usePdf'
          options={['Yes', 'No']}
          value={usePdf}
          onChange={setUsePdf}
        />
        <button
          className='activity-pdf-btn'
          disabled={usePdf === 'No'}
          onClick={() => fileInputRef.current.click()}
        >
          {pdfFile ? pdfFile.name : 'PDF 🗎'}
        </button>
        <input
          type='file'
          accept='.pdf'
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={(e) => setPdfFile(e.target.files[0] ?? null)}
        />

        {courses.length === 0 && (
          <p className="activity-no-courses-warning">
            You need to create a course before you can create an activity.
          </p>
        )}
        
        <button
          className='btn-join create-course-submit'
          onClick={submit}
          disabled={loading || courses.length === 0 || !course || !title.trim()}
        >
          <img src={activityIcon} alt="" className='btn-inline-icon' />
          {loading ? 'Creating...' : 'Create Activity'}
        </button>
      </div>
    </div>
  )
}

export default CreateActivityPopup