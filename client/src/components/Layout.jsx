import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'
import Sidebar from './Sidebar'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <NavBar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout



