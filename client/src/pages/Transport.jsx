import { useState, useEffect } from 'react'
import { Plane, Car, Train, Bus, RefreshCw, Clock, AlertTriangle, CheckCircle, ExternalLink, MapPin } from 'lucide-react'
import { transport as transportApi } from '../services/api'
import './Transport.css'

// Demo data
const demoFlights = [
  { flight_number: 'EI123', airline: 'Aer Lingus', origin: 'London Heathrow', arrival_time: new Date(Date.now() + 3600000).toISOString(), status: 'en_route', delay_minutes: 0 },
  { flight_number: 'BA456', airline: 'British Airways', origin: 'Paris CDG', arrival_time: new Date(Date.now() + 7200000).toISOString(), status: 'delayed', delay_minutes: 25 },
  { flight_number: 'AF789', airline: 'Air France', origin: 'Amsterdam', arrival_time: new Date(Date.now() + 10800000).toISOString(), status: 'scheduled', delay_minutes: 0 },
  { flight_number: 'LH101', airline: 'Lufthansa', origin: 'Frankfurt', arrival_time: new Date(Date.now() + 14400000).toISOString(), status: 'en_route', delay_minutes: 10 },
]

const demoTraffic = {
  route_key: 'dublin_airport_to_hotel',
  travel_time_mins: 35,
  traffic_status: 'moderate',
  last_updated: new Date().toISOString()
}

const demoRail = [
  { route_key: 'dart_north', transport_type: 'rail', disruption_info: null, traffic_status: 'light', last_updated: new Date().toISOString() },
  { route_key: 'dart_south', transport_type: 'rail', disruption_info: 'Minor delays due to signal issues', traffic_status: 'moderate', last_updated: new Date().toISOString() },
  { route_key: 'intercity_cork', transport_type: 'rail', disruption_info: null, traffic_status: 'light', last_updated: new Date().toISOString() },
]

const demoBus = [
  { route_key: 'airlink_747', transport_type: 'bus', disruption_info: null, traffic_status: 'light', last_updated: new Date().toISOString() },
  { route_key: 'route_16', transport_type: 'bus', disruption_info: 'Diversion on O\'Connell Street', traffic_status: 'heavy', last_updated: new Date().toISOString() },
]

function Transport() {
  const [flights, setFlights] = useState([])
  const [traffic, setTraffic] = useState(null)
  const [rail, setRail] = useState([])
  const [bus, setBus] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    loadAllData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAllData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [flightsData, trafficData, railData, busData] = await Promise.all([
        transportApi.getFlights().catch(() => demoFlights),
        transportApi.getTraffic().catch(() => demoTraffic),
        transportApi.getRail().catch(() => demoRail),
        transportApi.getBus().catch(() => demoBus)
      ])
      setFlights(flightsData?.length ? flightsData : demoFlights)
      setTraffic(trafficData?.route_key ? trafficData : demoTraffic)
      setRail(railData?.length ? railData : demoRail)
      setBus(busData?.length ? busData : demoBus)
      setLastRefresh(new Date())
    } catch (err) {
      console.log('Using demo transport data')
      setFlights(demoFlights)
      setTraffic(demoTraffic)
      setRail(demoRail)
      setBus(demoBus)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delayed':
      case 'heavy':
        return <AlertTriangle size={14} className="status-icon warning" />
      case 'cancelled':
        return <AlertTriangle size={14} className="status-icon danger" />
      case 'landed':
      case 'light':
        return <CheckCircle size={14} className="status-icon success" />
      default:
        return <Clock size={14} className="status-icon" />
    }
  }

  const getTrafficColor = (status) => {
    switch (status) {
      case 'light': return 'traffic-light'
      case 'moderate': return 'traffic-moderate'
      case 'heavy': return 'traffic-heavy'
      default: return ''
    }
  }

  return (
    <div className="transport-page">
      <div className="transport-header">
        <h1>Transport Monitor</h1>
        <div className="header-actions">
          <span className="last-update">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button className="refresh-btn" onClick={loadAllData}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="transport-grid">
        {/* Flights Panel */}
        <div className="transport-panel flights-panel">
          <div className="panel-header">
            <Plane size={18} />
            <h2>Dublin Airport Arrivals</h2>
            <a 
              href="https://www.dublinairport.com/flight-information/live-arrivals" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="panel-content">
            <table className="flights-table">
              <thead>
                <tr>
                  <th>Flight</th>
                  <th>Origin</th>
                  <th>Arrival</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {flights.map(flight => (
                  <tr key={flight.flight_number} className={flight.status === 'delayed' ? 'delayed' : ''}>
                    <td className="flight-number">{flight.flight_number}</td>
                    <td className="flight-origin">{flight.origin}</td>
                    <td className="flight-time">
                      {formatTime(flight.arrival_time)}
                      {flight.delay_minutes > 0 && (
                        <span className="delay-badge">+{flight.delay_minutes}m</span>
                      )}
                    </td>
                    <td className="flight-status">
                      {getStatusIcon(flight.status)}
                      <span className={`status-text ${flight.status}`}>
                        {flight.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Traffic Panel */}
        <div className="transport-panel traffic-panel">
          <div className="panel-header">
            <Car size={18} />
            <h2>Traffic to Hotel</h2>
            <a 
              href="https://www.google.com/maps/dir/Dublin+Airport/Dublin+City+Centre" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="panel-content">
            {traffic && (
              <div className="traffic-display">
                <div className="traffic-route">
                  <div className="route-point">
                    <Plane size={20} />
                    <span>Dublin Airport</span>
                  </div>
                  <div className={`route-line ${getTrafficColor(traffic.traffic_status)}`}></div>
                  <div className="route-point">
                    <MapPin size={20} />
                    <span>The Fitz Hotel</span>
                  </div>
                </div>
                <div className="traffic-stats">
                  <div className="travel-time">
                    <span className="time-value">{traffic.travel_time_mins}</span>
                    <span className="time-unit">mins</span>
                  </div>
                  <div className={`traffic-indicator ${getTrafficColor(traffic.traffic_status)}`}>
                    {traffic.traffic_status.charAt(0).toUpperCase() + traffic.traffic_status.slice(1)} Traffic
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rail Panel */}
        <div className="transport-panel rail-panel">
          <div className="panel-header">
            <Train size={18} />
            <h2>Irish Rail Status</h2>
            <a 
              href="https://www.irishrail.ie/en-ie/train-timetables/live-departure-times" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="panel-content">
            <div className="status-list">
              {rail.map(item => (
                <div key={item.route_key} className="status-item">
                  <div className="status-header">
                    {getStatusIcon(item.traffic_status)}
                    <span className="route-name">
                      {item.route_key.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  {item.disruption_info && (
                    <p className="disruption-info">{item.disruption_info}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bus Panel */}
        <div className="transport-panel bus-panel">
          <div className="panel-header">
            <Bus size={18} />
            <h2>Bus Status</h2>
            <a 
              href="https://www.dublinbus.ie/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <div className="panel-content">
            <div className="status-list">
              {bus.map(item => (
                <div key={item.route_key} className="status-item">
                  <div className="status-header">
                    {getStatusIcon(item.traffic_status)}
                    <span className="route-name">
                      {item.route_key.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  {item.disruption_info && (
                    <p className="disruption-info">{item.disruption_info}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Transport



