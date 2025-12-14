import './StatusBadge.css'

const statusConfig = {
  open: { label: 'OPEN', className: 'status-open' },
  pending: { label: 'PEND', className: 'status-pending' },
  confirmed: { label: 'CONFR', className: 'status-confirmed' },
  closed: { label: 'CLOSED', className: 'status-closed' },
  transferred: { label: 'TRANSF', className: 'status-transferred' },
  delayed: { label: 'DELAYED', className: 'status-delayed' },
  on_time: { label: 'ON TIME', className: 'status-ontime' },
  ord: { label: 'ORD', className: 'status-ord' }
}

function StatusBadge({ status, onClick }) {
  const config = statusConfig[status] || { label: status?.toUpperCase(), className: 'status-default' }

  return (
    <button 
      className={`status-badge ${config.className}`}
      onClick={onClick}
      type="button"
    >
      {config.label}
    </button>
  )
}

export default StatusBadge



