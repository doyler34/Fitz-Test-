import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Ticket, Users, Train, Search, Bell, Settings, HelpCircle } from 'lucide-react'
import { useFilters } from '../hooks/useFilters'
import TicketModal from './TicketModal'
import './NavBar.css'

function NavBar() {
  const { searchTerm, setSearchTerm, overviewCounts } = useFilters()
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketType, setTicketType] = useState('guest_request')

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/guests', label: 'Guests', icon: Users },
    { to: '/transport', label: 'Transport', icon: Train },
  ]

  const handleCreateTicket = (type) => {
    setTicketType(type)
    setShowTicketModal(true)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <span className="logo-icon">F</span>
          </div>
          <span className="navbar-title">Fitz Companion</span>
        </div>

        <nav className="navbar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <button className="navbar-btn primary" onClick={() => handleCreateTicket('guest_request')}>
            <span className="btn-plus">+</span>
            Guest Request
          </button>
          <button className="navbar-btn secondary" onClick={() => handleCreateTicket('internal_request')}>
            <span className="btn-plus">+</span>
            Internal Request
          </button>
        </div>

        <div className="navbar-right">
          <div className="navbar-search">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search by name or room" 
              value={searchTerm || ''}
              onChange={handleSearch}
            />
          </div>
          <button className="navbar-icon-btn" title="Support">
            <HelpCircle size={18} />
          </button>
          <button className="navbar-icon-btn has-badge" title="Notifications">
            <Bell size={18} />
            {overviewCounts?.alerts > 0 && <span className="badge">{overviewCounts.alerts}</span>}
          </button>
          <button className="navbar-icon-btn" title="Settings">
            <Settings size={18} />
          </button>
          <div className="navbar-user">
            <div className="user-avatar">JS</div>
          </div>
        </div>
      </header>

      {showTicketModal && (
        <TicketModal
          type={ticketType}
          onClose={() => setShowTicketModal(false)}
          onCreated={() => {
            setShowTicketModal(false)
          }}
        />
      )}
    </>
  )
}

export default NavBar
