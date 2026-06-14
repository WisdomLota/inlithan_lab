import { useState } from 'react'
import panelIcon from '../assets/courses-g.svg'
import { createCourse } from '../api/courses'
import { useCourses } from '../context/useCourses'

function CreateCoursePopup({ onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [about, setAbout] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshCourses } = useCourses()

  const handleCreate = async () => {
    if (!title.trim()) return
    setLoading(true)
    try {
      await createCourse({ title, about, code: 'All 0', aboutPoints: [], aboutClosing: '' })
      await refreshCourses()
      onCreate()
    } catch (err) {
      console.error('Failed to create course:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='popup-overlay' onClick={onClose}>
      <div className='create-course-popup' onClick={(e) => e.stopPropagation()}>
        <div className='create-course-popup-header'>
          <span>Course Creation</span>
          <button className='new-student-popup-close' onClick={onClose}>✕</button>
        </div>

        <p className='create-course-popup-text'>
          Enter the title and description for your new course.
        </p>

        <input
          type='text'
          className='create-course-input'
          placeholder='Course Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type='text'
          className='create-course-input'
          placeholder='Short Description'
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />

        <button className='btn-join create-course-submit' onClick={handleCreate} disabled={loading}>
          <img src={panelIcon} alt="" className='btn-inline-icon' />
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </div>
    </div>
  )
}

export default CreateCoursePopup