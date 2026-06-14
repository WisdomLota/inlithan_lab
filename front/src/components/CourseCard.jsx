import { useNavigate } from 'react-router-dom'
// import './CourseCard.css'

function CourseCard({ id, title, questions, icon, code, students }) {
  const navigate = useNavigate()
  const isTeacher = students != null

  return (
    <div className='course-card' onClick={() => navigate(`/courses/${id}`)}>
      <img src={icon} alt="icon" className='card-icon' />
      <h3 className='card-title'>{title}</h3>
      {isTeacher ? (
        <>
          <p className='card-questions'>{code}</p>
          <p className='card-questions'>{students} Students</p>
        </>
      ) : (
        <p className='card-questions'>{questions} questions</p>
      )}
    </div>
  )
}

export default CourseCard