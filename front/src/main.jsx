//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CoursesProvider } from './context/CoursesProvider'
import { ActivitiesProvider } from './context/ActivitiesProvider'
import { AuthProvider} from './context/AuthProvider'
import ErrorBoundary from './components/ErrorBoundary'
import './api/axiosConfig'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CoursesProvider>
      <ActivitiesProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ActivitiesProvider>
    </CoursesProvider>
  </AuthProvider>
)
