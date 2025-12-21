import { useState, useEffect } from 'react'
import { Plus, Package, Search, RefreshCw, Clock, User, MapPin, Calendar, Image, X } from 'lucide-react'
import './Storage.css'

// Demo storage items
const demoStorageItems = [
  {
    id: '1',
    item_name: 'Suitcase - Black Samsonite',
    guest_name: 'VAUGH, VIRGINIA',
    room_number: '101',
    status: 'in_house',
    stored_by: 'John Smith',
    location: 'Main Storage Room',
    image_url: null,
    stored_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    item_name: 'Golf Clubs Set',
    guest_name: 'BALLARD, JOHN',
    room_number: '312',
    status: 'check_in',
    stored_by: 'Sarah Johnson',
    location: 'Basement Storage',
    stored_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    item_name: 'Artwork - Framed Painting',
    guest_name: 'LEE, DOROTHY',
    room_number: '707',
    status: 'check_out',
    stored_by: 'Mike Davis',
    location: 'Secure Storage',
    stored_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

function Storage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    item_name: '',
    guest_name: '',
    room_number: '',
    status: 'in_house',
    stored_by: '',
    location: '',
    custom_location: ''
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadItems()
  }, [statusFilter])

  const loadItems = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      // const data = await storageApi.list({ status: statusFilter })
      // setItems(data)
      
      // Using demo data for now
      let filtered = demoStorageItems
      if (statusFilter !== 'all') {
        filtered = filtered.filter(item => item.status === statusFilter)
      }
      setItems(filtered)
    } catch (err) {
      console.log('Using demo storage items:', err.message)
      setItems(demoStorageItems)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.item_name.trim() || !formData.stored_by.trim() || !formData.location.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      // Convert image to base64 if present
      let imageData = null
      if (imageFile) {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
      }

      const newItem = {
        ...formData,
        location: formData.location === 'Other' ? formData.custom_location : formData.location,
        image_url: imageData,
        id: Date.now().toString(),
        stored_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
      delete newItem.custom_location

      // TODO: Replace with actual API call
      // await storageApi.create(newItem)

      setItems(prev => [newItem, ...prev])
      setShowCreateModal(false)
      setFormData({
        item_name: '',
        guest_name: '',
        room_number: '',
        status: 'in_house',
        stored_by: '',
        location: '',
        custom_location: ''
      })
      removeImage()
    } catch (err) {
      console.error('Failed to create storage item:', err)
      alert('Failed to create storage item. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB')
        return
      }
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById('storage-image-input')
    if (fileInput) fileInput.value = ''
  }

  const filteredItems = items.filter(item => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      item.item_name?.toLowerCase().includes(searchLower) ||
      item.guest_name?.toLowerCase().includes(searchLower) ||
      item.room_number?.includes(search) ||
      item.stored_by?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    )
  })

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'check_in': return 'Check-In'
      case 'check_out': return 'Check-Out'
      case 'in_house': return 'In-House'
      default: return status
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'check_in': return 'status-checkin'
      case 'check_out': return 'status-checkout'
      case 'in_house': return 'status-inhouse'
      default: return ''
    }
  }

  return (
    <div className="storage-page">
      {/* Header */}
      <div className="storage-header">
        <h1>
          <Package size={24} />
          Storage
        </h1>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          Store Item
        </button>
      </div>

      {/* Filters */}
      <div className="storage-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search items, guests, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="check_in">Check-In</option>
            <option value="check_out">Check-Out</option>
            <option value="in_house">In-House</option>
          </select>
        </div>

        <button className="refresh-btn" onClick={loadItems}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Storage Items List - Desktop */}
      <div className="storage-table desktop-table">
        <div className="table-header">
          <span>Time</span>
          <span>Item Name</span>
          <span>Guest</span>
          <span>Room</span>
          <span>Status</span>
          <span>Stored By</span>
          <span>Location</span>
          <span>Image</span>
        </div>
        <div className="table-body">
          {loading ? (
            <div className="loading-state">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-state">No storage items found</div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className="table-row" onClick={() => setSelectedItem(item)}>
                <span className="col-time">
                  <Clock size={14} />
                  {formatTime(item.stored_at)}
                </span>
                <span className="col-item">{item.item_name}</span>
                <span className="col-guest">{item.guest_name || '—'}</span>
                <span className="col-room">{item.room_number || '—'}</span>
                <span className={`col-status ${getStatusClass(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
                <span className="col-stored-by">
                  <User size={14} />
                  {item.stored_by}
                </span>
                <span className="col-location">
                  <MapPin size={14} />
                  {item.location}
                </span>
                <span className="col-image">
                  {item.image_url ? (
                    <div className="image-thumbnail" onClick={(e) => { e.stopPropagation(); setSelectedItem(item) }}>
                      <img src={item.image_url} alt={item.item_name} />
                    </div>
                  ) : (
                    <span className="no-image">—</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="mobile-storage-list">
        {loading ? (
          <div className="loading-state">Loading items...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">No storage items found</div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="mobile-storage-card" onClick={() => setSelectedItem(item)}>
              <div className="mobile-card-header">
                <div className="mobile-card-time">
                  <Clock size={14} />
                  {formatTime(item.stored_at)}
                </div>
                <span className={`status-badge ${getStatusClass(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
              <div className="mobile-card-item">{item.item_name}</div>
              <div className="mobile-card-guest">
                {item.guest_name || 'No guest'} {item.room_number ? `• Room ${item.room_number}` : ''}
              </div>
              <div className="mobile-card-meta">
                <span>
                  <User size={12} />
                  {item.stored_by}
                </span>
                <span>
                  <MapPin size={12} />
                  {item.location}
                </span>
              </div>
              {item.image_url && (
                <div className="mobile-card-image" onClick={(e) => e.stopPropagation()}>
                  <img src={item.image_url} alt={item.item_name} onClick={() => setSelectedItem(item)} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats Footer */}
      <div className="storage-footer">
        <div className="stats">
          <span>Total: {filteredItems.length}</span>
          <span>Check-In: {filteredItems.filter(i => i.status === 'check_in').length}</span>
          <span>Check-Out: {filteredItems.filter(i => i.status === 'check_out').length}</span>
          <span>In-House: {filteredItems.filter(i => i.status === 'in_house').length}</span>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateModal(false)
          removeImage()
        }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Store Item</h2>
              <button className="modal-close" onClick={() => {
                setShowCreateModal(false)
                removeImage()
              }}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleChange}
                    placeholder="e.g. Suitcase - Black Samsonite"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Guest Name (optional)</label>
                    <input
                      type="text"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      placeholder="Guest name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Number (optional)</label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleChange}
                      placeholder="e.g. 101"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <option value="check_in">Check-In</option>
                    <option value="check_out">Check-Out</option>
                    <option value="in_house">In-House</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stored By *</label>
                  <input
                    type="text"
                    name="stored_by"
                    value={formData.stored_by}
                    onChange={handleChange}
                    placeholder="Name of person storing the item"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select location...</option>
                    <option value="Main Storage Room">Main Storage Room</option>
                    <option value="Basement Storage">Basement Storage</option>
                    <option value="Secure Storage">Secure Storage</option>
                    <option value="Front Desk Storage">Front Desk Storage</option>
                    <option value="Concierge Storage">Concierge Storage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {formData.location === 'Other' && (
                  <div className="form-group">
                    <label>Custom Location *</label>
                    <input
                      type="text"
                      name="custom_location"
                      value={formData.custom_location}
                      onChange={handleChange}
                      placeholder="Enter custom location"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Image (Optional)</label>
                  <div className="image-upload-section">
                    {imagePreview ? (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Preview" className="image-preview" />
                        <button type="button" className="remove-image-btn" onClick={removeImage}>
                          <X size={16} />
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="image-upload-label">
                        <input
                          id="storage-image-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                        />
                        <div className="image-upload-placeholder">
                          <Image size={24} />
                          <span>Click to upload image</span>
                          <span className="image-upload-hint">Max 10MB</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="form-info">
                  <Clock size={14} />
                  <span>Time will be automatically set to current time</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Storing...' : 'Store Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="storage-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Storage Item Details</h2>
              <button className="modal-close" onClick={() => setSelectedItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="storage-detail-body">
              {/* Image Section */}
              {selectedItem.image_url && (
                <div className="detail-image-section">
                  <img src={selectedItem.image_url} alt={selectedItem.item_name} className="detail-image-large" />
                </div>
              )}

              {/* Details Section */}
              <div className="detail-info-section">
                <div className="detail-info-row">
                  <label>Item Name:</label>
                  <span>{selectedItem.item_name}</span>
                </div>

                {selectedItem.guest_name && (
                  <div className="detail-info-row">
                    <label>Guest:</label>
                    <span>{selectedItem.guest_name}</span>
                  </div>
                )}

                {selectedItem.room_number && (
                  <div className="detail-info-row">
                    <label>Room Number:</label>
                    <span>{selectedItem.room_number}</span>
                  </div>
                )}

                <div className="detail-info-row">
                  <label>Status:</label>
                  <span className={`detail-status-badge ${getStatusClass(selectedItem.status)}`}>
                    {getStatusLabel(selectedItem.status)}
                  </span>
                </div>

                <div className="detail-info-row">
                  <label>Stored By:</label>
                  <span>
                    <User size={16} />
                    {selectedItem.stored_by}
                  </span>
                </div>

                <div className="detail-info-row">
                  <label>Location:</label>
                  <span>
                    <MapPin size={16} />
                    {selectedItem.location}
                  </span>
                </div>

                <div className="detail-info-row">
                  <label>Stored At:</label>
                  <span>
                    <Clock size={16} />
                    {formatTime(selectedItem.stored_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Storage

