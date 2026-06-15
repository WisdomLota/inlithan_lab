import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import searchIcon from '../assets/search-g.svg'
import notification from '../assets/notification-g.svg'
import usrIcon from '../assets/profile-w.svg'
import { useAuth } from '../context/useAuth'
import { globalSearch } from '../api/search'

function Header({title, showUser}){
    const { user } = useAuth()
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState(null)
    const [showDropdown, setShowDropdown] = useState(false)
    const wrapRef = useRef(null)

    const handleLogout = () => {
      localStorage.removeItem('token')
      window.location.href = '/'
    }

    useEffect(() => {
      if (!query.trim() || query.trim().length < 2) {
        setResults(null)
        setShowDropdown(false)
        return
      }
      const timer = setTimeout(async () => {
        try {
          const res = await globalSearch(query.trim())
          setResults(res.data)
          setShowDropdown(true)
        } catch (err) {
          console.error('Search failed:', err)
        }
      }, 300)
      return () => clearTimeout(timer)
    }, [query])

    useEffect(() => {
      function handleClickOutside(e) {
        if (wrapRef.current && !wrapRef.current.contains(e.target)) {
          setShowDropdown(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function goTo(path) {
      setShowDropdown(false)
      setQuery('')
      navigate(path)
    }

    const hasResults = results && (results.courses.length || results.activities.length || results.students.length)

return (

<div className='header'>
    
    {title && <h2 className='header-title'>{title}</h2>}
    <div className='search-bar' ref={wrapRef} style={{ position: 'relative' }}>
        <img src={searchIcon} alt="searchIcon" />
        <input
          type="text"
          placeholder='Search'
          className='search-input'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results && setShowDropdown(true)}
        />

        {showDropdown && (
          <div className='search-dropdown'>
            {!hasResults ? (
              <div className='search-dropdown-empty'>No results found</div>
            ) : (
              <>
                {results.courses.length > 0 && (
                  <div className='search-dropdown-group'>
                    <span className='search-dropdown-label'>Courses</span>
                    {results.courses.map(c => (
                      <div key={c.id} className='search-dropdown-item' onClick={() => goTo(`/courses/${c.id}`)}>
                        {c.title}
                      </div>
                    ))}
                  </div>
                )}
                {results.activities.length > 0 && (
                  <div className='search-dropdown-group'>
                    <span className='search-dropdown-label'>Activities</span>
                    {results.activities.map(a => (
                      <div key={a.id} className='search-dropdown-item' onClick={() => goTo(`/courses/${a.courseId?._id || a.courseId}/activity/${a.id}`)}>
                        {a.title} <span className='search-dropdown-type'>{a.type}</span>
                      </div>
                    ))}
                  </div>
                )}
                {results.students.length > 0 && (
                  <div className='search-dropdown-group'>
                    <span className='search-dropdown-label'>Students</span>
                    {results.students.map(s => (
                      <div key={s.id} className='search-dropdown-item' onClick={() => goTo(`/students`)}>
                        {s.name}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
    </div>

    {showUser ? (
    <div className='header-right'>
            <div className='username-frame'>
                <div className='notification'>
                    <img src={notification} alt="Notification Icon" />
                </div>

                <div className='username'>
                    <img src={usrIcon} alt="User Icon" />

                        <div className='header-user'>
                        <span>{user?.name || 'User'}</span>
                        </div>
                </div>

                <button className='dev-role-toggle' onClick={handleLogout}>
                  Logout
                </button>
            </div>
    </div>
    ) : <div></div>}

</div>

)}

export default Header