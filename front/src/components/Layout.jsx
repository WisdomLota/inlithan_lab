import Sidebar from './sidebar'
import Header from './Header'
import Footer from './Footer'

function Layout({ children, showFooter = true, showHeader = true, headerTitle = '', showUser = false }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        {showHeader && <Header title = {headerTitle} showUser = {showUser}/>}
        <div className="layout-body">
          {children}
        </div>
        {showFooter && <Footer />}
      </div>
    </div>
  )
}

export default Layout