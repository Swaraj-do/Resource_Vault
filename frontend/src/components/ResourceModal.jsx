import { useState, useEffect } from 'react'
import s from './Modal.module.css'

export default function ResourceModal({ open, topicName, onClose, onSave }) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (open) { setName(''); setUrl('') } }, [open])

  const handleSave = async () => {
    if (!name.trim() || !url.trim()) return
    setLoading(true)
    await onSave({ name: name.trim(), url: url.trim() })
    setLoading(false)
  }

  if (!open) return null
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>✕</button>
        <div className={s.title}>Add Link</div>
        <div className={s.subtitle}>Adding to: <strong style={{ color:'var(--accent)' }}>{topicName}</strong></div>
        <div className={s.field}><label>Name</label><input type="text" placeholder="e.g. React Official Docs" value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
        <div className={s.field}><label>URL</label><input type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} /></div>
        <div className={s.actions}>
          <button className={s.btn_cancel} onClick={onClose}>Cancel</button>
          <button className={s.btn_save} onClick={handleSave} disabled={loading || !name.trim() || !url.trim()}>{loading ? 'Adding...' : 'Add Link'}</button>
        </div>
      </div>
    </div>
  )
}
