import { useState, useEffect } from 'react'
import { X, AlertCircle, Clock, CheckCircle, Bell } from 'lucide-react'
import { useFilters } from '../hooks/useFilters'
import './NotificationsPanel.css'

function NotificationsPanel({ onClose }) {
  const { filteredTickets } = useFilters()
  
  // Get alerts - high priority or urgent tickets that are open/pending
  const alerts = (filteredTickets || []).filter(ticket => 
    (ticket.priority === 'high' || ticket.priority === 'urgent') && 
    (ticket.status?.toLowerCase() === 'open' || ticket.status?.toLowerCase() === 'pending')
  )

  // Get pending items
  const pending = (filteredTickets || []).filter(ticket => 
    ticket.status?.toLowerCase() === 'pending'
  )

  const getTimeAgo = (time) => {
    const now = new Date()
    const then = new Date(time)
    const diff = Math.floor((now - then) / 1000 / 60) // minutes
    if (diff < 1) return 'Just now'
    if (diff < 60) return `${diff}m ago`
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
    return `${Math.floor(diff / 1440)}d ago`
  }

  return (
    <div className="notifications-overlay" onClick={onClose}>
      <div className="notifications-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h3><Bell size={18} /> Notifications</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="panel-content">
          {/* Alerts Section */}
          <div className="notification-section">
            <h4><AlertCircle size={14} /> Alerts ({alerts.length})</h4>
            {alerts.length === 0 ? (
              <p className="empty-message">No active alerts</p>
            ) : (
              <div className="notification-list">
                {alerts.map(alert => (
                  <div key={alert.id} className="notification-item alert">
                    <div className="notification-icon">
                      <AlertCircle size={16} />
                    </div>
                    <div className="notification-content">
                      <span className="notification-title">
                        {alert.priority?.toUpperCase()} - {alert.room_number || alert.roomNumber || 'No room'}
                      </span>
                      <span className="notification-summary">{alert.summary}</span>
                      <span className="notification-time">{getTimeAgo(alert.time || alert.scheduled_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Section */}
          <div className="notification-section">
            <h4><Clock size={14} /> Pending ({pending.length})</h4>
            {pending.length === 0 ? (
              <p className="empty-message">No pending items</p>
            ) : (
              <div className="notification-list">
                {pending.map(item => (
                  <div key={item.id} className="notification-item pending">
                    <div className="notification-icon">
                      <Clock size={16} />
                    </div>
                    <div className="notification-content">
                      <span className="notification-title">
                        {item.guest_name || item.guestName || 'Internal'} - Room {item.room_number || item.roomNumber || 'N/A'}
                      </span>
                      <span className="notification-summary">{item.summary}</span>
                      <span className="notification-time">{getTimeAgo(item.time || item.scheduled_time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="panel-footer">
          <button className="mark-all-btn" onClick={onClose}>
            <CheckCircle size={14} />
            Mark All Read
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationsPanel

