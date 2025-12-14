import { useState } from 'react'
import { X, User, Bell, Moon, Sun, Volume2, VolumeX, LogOut } from 'lucide-react'
import './SettingsPanel.css'

function SettingsPanel({ onClose }) {
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    notificationsEnabled: localStorage.getItem('notificationsEnabled') !== 'false',
  })

  const handleToggle = (key) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    localStorage.setItem(key, String(newValue))
    
    // Apply dark mode immediately
    if (key === 'darkMode') {
      document.body.classList.toggle('dark-mode', newValue)
    }
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header">
          <h3>Settings</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="panel-content">
          {/* User Section */}
          <div className="settings-section">
            <h4>Account</h4>
            <div className="user-info">
              <div className="user-avatar-large">JS</div>
              <div className="user-details">
                <span className="user-name">John Staff</span>
                <span className="user-role">Concierge</span>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="settings-section">
            <h4>Appearance</h4>
            <div className="setting-item">
              <div className="setting-info">
                {settings.darkMode ? <Moon size={18} /> : <Sun size={18} />}
                <span>Dark Mode</span>
              </div>
              <button 
                className={`toggle-switch ${settings.darkMode ? 'active' : ''}`}
                onClick={() => handleToggle('darkMode')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-section">
            <h4>Notifications</h4>
            <div className="setting-item">
              <div className="setting-info">
                <Bell size={18} />
                <span>Push Notifications</span>
              </div>
              <button 
                className={`toggle-switch ${settings.notificationsEnabled ? 'active' : ''}`}
                onClick={() => handleToggle('notificationsEnabled')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>Sound Effects</span>
              </div>
              <button 
                className={`toggle-switch ${settings.soundEnabled ? 'active' : ''}`}
                onClick={() => handleToggle('soundEnabled')}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>

          {/* About */}
          <div className="settings-section">
            <h4>About</h4>
            <div className="about-info">
              <p><strong>Fitz Companion</strong></p>
              <p>Version 1.0.0</p>
              <p className="muted">Hotel Concierge Management System</p>
            </div>
          </div>
        </div>

        <div className="panel-footer">
          <button className="logout-btn">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel

