import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import activityIcon from '../assets/activities-g.svg'
import { useCourses } from '../context/useCourses'

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

function CreateActivityPopup({ onClose }) {
  const { courses } = useCourses()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [course, setCourse] = useState(courses[0]?.id ?? '')
  const [activityType, setActivityType] = useState('Assignment')
  const [questionCount, setQuestionCount] = useState('')
  const [timeBased, setTimeBased] = useState('No')
  const [minutes, setMinutes] = useState('')
  const [questionType, setQuestionType] = useState('Theory')
  const [usePdf, setUsePdf] = useState('No')
  const [pdfFile, setPdfFile] = useState(null)

  const submit = () => {
    if (!course || courses.length === 0) return

    navigate('/labs', {
      state: {
        activityRequest: {
          courseId: course,
          activityType,
          questionCount: Number(questionCount) || 0,
          timeBased: timeBased === 'Yes',
          minutes: Number(minutes) || undefined,
          questionType,
          pdfFile: usePdf === 'Yes' ? pdfFile : null,
        }
      }
    })
    onClose()
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

        <span className='activity-field-label'>Activity Type:</span>
        <RadioGroup
          name='activityType'
          options={['Quiz', 'Assignment']}
          value={activityType}
          onChange={setActivityType}
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
          disabled={courses.length === 0 || !course}
        >
          <img src={activityIcon} alt="" className='btn-inline-icon' />
          Create Activity
        </button>
      </div>
    </div>
  )
}

export default CreateActivityPopup