import './Dashboard.css'

import emptyIcon from '../assets/emptyIcon.png'

import CourseCard from '../components/CourseCard'
import ActivityCard from '../components/ActivityCard'


import { useCourses } from '../context/useCourses'
import { useActivities } from '../context/useActivities'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'
import TeacherDashboard from './TeacherDashboard'



function Dashboard() {

    const { courses } = useCourses()
    const { activities } = useActivities([])
    const { user } = useAuth()
    const navigate = useNavigate()

    if (user?.role === 'teacher') return <TeacherDashboard />

  return (

    <div className='main'>
       

        <div className='body'>
           <div className='body'>
                {courses.length === 0 ? (
                <div className='empty-state'>
                    <img src={emptyIcon} alt="empty" />
                    <p>Your Courses and Activities will appear here once you Join a course</p>
                    <button className='btn-join'>Join a Course</button>
                    <button className='btn-explore'>Explore Courses</button>
                </div>
                ) : (
                     <>
                        <h2 className='section-title'>Courses</h2>
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
                    </>
                )}
            </div>
        </div>
    </div>

  )
}



export default Dashboard