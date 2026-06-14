import { useState } from 'react'
import { useCourses } from '../context/useCourses.js'
import { useAuth } from '../context/useAuth'
import emptyIcon from '../assets/emptyIcon.png'
import panelIcon from '../assets/courses-g.svg'
import './Dashboard.css'

import CourseCard from '../components/CourseCard'
import CreateCoursePopup from '../components/CreateCoursePopup'



function Courses (){
    const { courses } = useCourses()
    const { user } = useAuth()
    const [showCreate, setShowCreate] = useState(false)
    const isTeacher = user.role === 'teacher'

    return (
        <>
            <div className='page-body'>
                {courses.length === 0 ? (
                        <div className='empty-state'>
                            <img src={emptyIcon} alt="empty" />
                            <p>You currently have no courses</p>
                            {isTeacher ? (
                                <button className='btn-join' onClick={() => setShowCreate(true)}>
                                    Create Course
                                </button>
                            ) : (
                                <>
                                    <button className='btn-join'>Join a Course</button>
                                    <button className='btn-explore'>Explore Courses</button>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            {isTeacher && (
                                <div className='page-actions'>
                                    <button className='teacher-panel-btn' onClick={() => setShowCreate(true)}>
                                        Create New Course
                                    </button>
                                </div>
                            )}
                            <div className='cards-row'>
                                {courses.map((course) => (
                                    <CourseCard
                                        key={course.id}
                                        id={course.id}
                                        title={course.title}
                                        questions={course.questions}
                                        icon={course.icon} />
                                ))}

                            </div>
                        </>
                    )}
                {showCreate && (
                    <CreateCoursePopup
                        onClose={() => setShowCreate(false)}
                        onCreate={() => setShowCreate(false)}
                    />
                )}
            </div>
        </>

    )
}

export default Courses
