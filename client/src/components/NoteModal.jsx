import { useState, useEffect } from 'react'
import { X, Send } from 'lucide-react'
import { timeline as timelineApi } from '../services/api'
import './NoteModal.css'

function NoteModal({ note, onClose, onCreated }) {
  const [content, setContent] = useState('')
  const [priority, setPriority] = useState('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (note) {
      setContent(note.content || note.summary || '')
      setPriority(note.priority || 'normal')
    } else {
      setContent('')
      setPriority('normal')
    }
  }, [note])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Note content is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (note) {
        await timelineApi.updateNote(note.id, content, priority)
      } else {
        await timelineApi.createNote(content, priority)
      }
      onCreated?.()
      onClose()
    } catch (err) {
      console.error(`Failed to ${note ? 'update' : 'create'} note:`, err)
      setError(`Failed to ${note ? 'update' : 'create'} note. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="note-modal-overlay" onClick={onClose}>
      <div className="note-modal" onClick={e => e.stopPropagation()}>
        <div className="note-modal-header">
          <h2>{note ? 'Edit Note' : 'Add Note'}</h2>
          <button className="note-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form className="note-modal-body" onSubmit={handleSubmit}>
          {error && (
            <div className="note-modal-error">{error}</div>
          )}

          <div className="note-form-group">
            <label>Note Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content..."
              rows={6}
              required
            />
          </div>

          <div className="note-form-group">
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="note-modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !content.trim()}
            >
              <Send size={16} />
              {note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NoteModal

