import { Bell, Mail, MessageSquare, Phone } from 'lucide-react'
import StatusBadge from './StatusBadge'
import './TimelineRow.css'

function TimelineRow({ item, onClick }) {
  const time = new Date(item.time)
  const timeStr = time.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })

  const getRowClass = () => {
    let classes = ['timeline-row']
    if (item.status === 'open') classes.push('row-open')
    if (item.status === 'pending') classes.push('row-pending')
    if (item.status === 'confirmed') classes.push('row-confirmed')
    if (item.status === 'closed') classes.push('row-closed')
    if (item.status === 'transferred') classes.push('row-transferred')
    if (item.status === 'delayed') classes.push('row-delayed')
    if (item.priority === 'high' || item.priority === 'urgent') classes.push('row-urgent')
    return classes.join(' ')
  }

  const getTypeLabel = () => {
    switch (item.ticketType || item.type) {
      case 'reminder': return 'REMINDER for'
      case 'guest_request': return ''
      case 'internal_request': return ''
      case 'arrival': return 'ARRIVING'
      case 'transport_alert': return 'TRANSPORT'
      default: return ''
    }
  }

  return (
    <div className={getRowClass()} onClick={() => onClick?.(item)}>
      <div className="timeline-time">{timeStr}</div>
      <div className="timeline-guest">{item.guestName || '—'}</div>
      <div className="timeline-room">{item.roomNumber || '—'}</div>
      <div className="timeline-summary">
        {getTypeLabel() && <span className="type-label">{getTypeLabel()}</span>}
        <span className="summary-text">{item.summary}</span>
      </div>
      <div className="timeline-status">
        <StatusBadge status={item.status} />
      </div>
      <div className="timeline-alerts">
        {item.hasAlert && (
          <button className="alert-btn active" title="Alert active">
            <Bell size={16} />
          </button>
        )}
        {!item.hasAlert && (
          <button className="alert-btn" title="Set alert">
            <Bell size={16} />
          </button>
        )}
        <button className="alert-btn" title="Send message">
          <Mail size={16} />
        </button>
      </div>
    </div>
  )
}

export default TimelineRow



