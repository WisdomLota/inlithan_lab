import './Dashboard.css'

import emptyIcon from '../assets/emptyIcon.png'
import panelIcon from '../assets/preview-a.svg'
import coursesimg from '../assets/courses-g.svg'

import CourseCard from '../components/CourseCard'
import ActivityCard from '../components/ActivityCard'
import NewStudentPopup from '../components/NewStudentPopup'
import CreateCoursePopup from '../components/CreateCoursePopup'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourses } from '../context/useCourses'
import { useActivities } from '../context/useActivities'

function TeacherDashboard() {
  const { courses } = useCourses()
  const { activities } = useActivities()
  const [showNewStudents, setShowNewStudents] = useState(false)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const navigate = useNavigate()

  if (courses.length === 0) {
    return (
      <div className='main'>
        <div className='body'>
          <div className='empty-state'>
            <img src={emptyIcon} alt="empty" />
            <p>Your Courses and Activities will appear here once you create a course</p>
            <button className='btn-join' onClick={() => setShowCreateCourse(true)}>
              <img src={panelIcon} alt="" className='btn-inline-icon' />
              Create Course
            </button>
          </div>
          {showCreateCourse && (
            <CreateCoursePopup
              onClose={() => setShowCreateCourse(false)}
              onCreate={() => navigate('/courses')}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='main'>
      <div className='body'>
        <div className='teacher-panel-wrap'>
          <div className='teacher-panel'>
            <span className='teacher-panel-title'>New Student Requests</span>
            <button className='teacher-panel-btn' onClick={() => setShowNewStudents(!showNewStudents)}>
              View Student List
            </button>
          </div>
          {showNewStudents && <NewStudentPopup onClose={() => setShowNewStudents(false)} />}
        </div>

        <div className='teacher-panel'>
          <span className='teacher-panel-title'>Student List</span>
          <button className='teacher-panel-btn' onClick={() => navigate('/students')}>
            View Student List
          </button>
        </div>

        <p className='section-title'>Courses</p>
        <div className='cards-row'>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              icon={coursesimg}
              code={course.code}
              students={course.students}
            />
          ))}
        </div>

        <h2 className='section-title'>Activities</h2>
        <div className='cards-row'>
          {activities.map((activity) => (
            <ActivityCard
            key={activity.id}
            type={activity.type}
            title={activity.title}
            total={activity.total}
            questions={activity.questions}
            questionCount={activity.questionCount}
            onClick={() => navigate(`/courses/${activity.courseId?._id || activity.courseId}/activity/${activity.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherDashboard
