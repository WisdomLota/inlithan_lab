import { NavLink, useNavigate } from 'react-router-dom'

import Lable from '../assets/inlithanLogoLable.png'
import activitiesimg from '../assets/activities-g.svg'
import activitiesimgActive from '../assets/activities-a.svg'
import homeimg from '../assets/home-g.svg'
import homeIconActive from '../assets/home-a.svg'
import labsimg from '../assets/lab-g.svg'
import labsimgActive from '../assets/lab-a.svg'
import coursesimg from '../assets/courses-g.svg'
import coursesimgActive from '../assets/courses-a.svg'
import exploreimg from '../assets/explore-g.svg'
// import settingsimg from '../assets/settings.png'
import studentListimg from '../assets/student-g.svg'
import studentListimgActive from '../assets/student-a.svg'
import panelIcon from '../assets/preview-a.svg'
// import './Layout.css'
import { useAuth } from '../context/useAuth'


function Sidebar(){
    const { user } = useAuth()
    const isTeacher = user?.role === 'teacher'
    const navigate = useNavigate()

    return(
        <div className='side-bar'>
            <div className='logo-icon'>
                <img src={Lable} alt="logo lable" className='logoIconImg top-nav'/>
            </div>

            <nav className='sidebar-nav'>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item top active' : 'nav-item top'}>
                {({ isActive }) => (
                    <>
                    <img src={isActive ? homeIconActive : homeimg} alt="home image" className='nav-icon'/>
                    Home
                    </>
                )}
                </NavLink>

                <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    {({ isActive }) => (
                    <>
                        <img src={isActive ? coursesimgActive : coursesimg} alt="home image" className='nav-icon'/>
                        Courses
                    </>
                    )}
                </NavLink>

                <NavLink to="/activities" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    {({ isActive }) => (
                    <>
                        <img src={isActive ? activitiesimgActive : activitiesimg} alt="activity image" className='nav-icon'/>
                        Activities
                    </>
                    )}
                </NavLink>

                {/* <NavLink to="/leaderboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <img src={studentListimg} alt="leaderboard image" className='nav-icon'/>
                    Leaderboard
                </NavLink> */}

                <NavLink to="/labs" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    {({ isActive }) => (
                    <>
                        <img src={isActive ? labsimgActive : labsimg} alt="activity image" className='nav-icon'/>
                        Labs
                    </>
                    )}
                </NavLink>

                {isTeacher ? (
                    <NavLink to="/students" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        {({ isActive }) => (
                        <>
                            <img src={isActive ? studentListimgActive : studentListimg} alt="activity image" className='nav-icon'/>
                            Student List
                        </>
                        )}
                    </NavLink>
                ) : (
                    <NavLink to="/explore" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <img src={exploreimg} alt="explore image" className='nav-icon'/>
                        Explore
                    </NavLink>
                )}

                {/* <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <img src={settingsimg} alt="settings image" className='nav-icon'/>
                    Settings
                </NavLink> */}

                <div className='sidebar-bottom'>
                    <div className='research'>
                        <div className='researchBox'>
                             <p>Research Papers for the week</p>
                        </div>
                        <button className='researchbtn' onClick={() => navigate('/research')}>
                            <img src={panelIcon} alt="" className='btn-inline-icon' />
                            Preview
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Sidebar