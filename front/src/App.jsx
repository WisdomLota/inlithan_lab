import Login from "./pages/Login"
import RolePick from "./pages/RolePick"
import Dashboard from "./pages/Dashboard"
import StudentList from "./pages/StudentList"
import Courses from "./pages/Courses"
import CourseDetail from "./pages/CourseDetail"
import WeekDetail from "./pages/WeekDetail"
import ActivityDetail from "./pages/ActivityDetail"
import Activities from "./pages/Activities"
import AILabs from "./pages/AILabs"
import Explore from "./pages/Explore"
import Settings from "./pages/Settings"
import AuthCallback from "./pages/AuthCallback"
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from "./components/Layout"
import Leaderboard from "./pages/Leaderboard"


function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/" element={<Login />} />
        <Route path="/role" element={<RolePick />} />
        <Route path="/dashboard" element={<Layout showHeader={true} showFooter={true} headerTitle="" showUser={true}><Dashboard /></Layout>} />
        <Route path="/students" element={<Layout showHeader={true} showFooter={true} headerTitle="Student List" showUser={false}><StudentList /></Layout>} />
        <Route path="/courses" element={<Layout showHeader={true} showFooter={true} headerTitle="Courses" showUser={false}><Courses /></Layout>} />
        <Route path="/courses/:courseId" element={<Layout showHeader={true} showFooter={true} headerTitle="Courses" showUser={false}><CourseDetail /></Layout>} />
        <Route path="/courses/:courseId/week/:weekId" element={<Layout showHeader={false} showFooter={false} headerTitle="" showUser={false}><WeekDetail /></Layout>} />
        <Route path="/courses/:courseId/activity/:activityId" element={<Layout showHeader={false} showFooter={false} headerTitle="" showUser={false}><ActivityDetail /></Layout>} />
        <Route path="/activities" element={<Layout showHeader={true} showFooter={true} headerTitle="Activities" showUser={false}><Activities /></Layout>} />
        <Route path="/labs" element={<Layout showHeader={true} showFooter={true} headerTitle="AILabs" showUser={false}><AILabs /></Layout>} />
        <Route path="/explore" element={<Layout showHeader={true} showFooter={false} headerTitle="Explore" showUser={false}><Explore /></Layout>} />
        <Route path="/settings" element={<Layout showHeader={true} showFooter={false} headerTitle="Settings" showUser={false}><Settings /></Layout>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/leaderboard" element={<Layout showHeader={true} showFooter={true} headerTitle="Leaderboard" showUser={false}><Leaderboard /></Layout>} />
      </Routes>
    </BrowserRouter>
  
  )
}
export default App
