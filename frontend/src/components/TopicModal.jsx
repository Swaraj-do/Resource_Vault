import { useState, useEffect } from 'react'
import s from './Modal.module.css'

const EMOJIS = ['📘','🎨','⚡','🧠','🔬','🌐','🛠️','🎯','🚀','💡','🔥','📊','🎵','🧪','🔐','📱','🌱','✨','🏗️','🎮']
const COLORS = [
  { id:'violet', hex:'#7c6af7' },
  { id:'pink',   hex:'#f76a8a' },
  { id:'cyan',   hex:'#6af7c8' },
  { id:'amber',  hex:'#f7c76a' },
]

export default function TopicModal({ open, topic, onClose, onSave }) {
  const [subject, setSubject] = useState('')
  const [topicName, setTopicName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [color, setColor] = useState('violet')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (topic) { setSubject(topic.subject); setTopicName(topic.topic); setEmoji(topic.emoji); setColor(topic.color) }
    else { setSubject(''); setTopicName(''); setEmoji(EMOJIS[0]); setColor('violet') }
  }, [topic, open])

  const handleSave = async () => {
    if (!subject.trim()) return
    setLoading(true)
    await onSave({ subject: subject.trim(), topic: topicName.trim() || subject.trim(), emoji, color })
    setLoading(false)
  }

  if (!open) return null
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <button className={s.close} onClick={onClose}>✕</button>
        <div className={s.title}>{topic ? 'Edit Topic' : 'New Topic'}</div>
        <div className={s.subtitle}>Organize your resources by subject & topic</div>
        <div className={s.field}><label>Subject Name <span style={{color:'var(--accent2)'}}>*</span></label><input type="text" placeholder="e.g. Computer Science, Design..." value={subject} onChange={e => setSubject(e.target.value)} autoFocus /></div>
        <div className={s.field}><label>Topic Name <span style={{color:'var(--text-muted)',fontSize:'10px',textTransform:'none',letterSpacing:0}}>(optional)</span></label><input type="text" placeholder="e.g. React Hooks, CSS Grid... (leave blank to use subject)" value={topicName} onChange={e => setTopicName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} /></div>
        <div className={s.field}>
          <label>Icon</label>
          <div className={s.emoji_grid}>{EMOJIS.map(e => <button key={e} className={`${s.emoji_opt} ${emoji === e ? s.selected : ''}`} onClick={() => setEmoji(e)}>{e}</button>)}</div>
        </div>
        <div className={s.field}>
          <label>Color</label>
          <div className={s.color_row}>{COLORS.map(c => <button key={c.id} className={`${s.color_opt} ${color === c.id ? s.color_selected : ''}`} style={{ background: c.hex }} onClick={() => setColor(c.id)} />)}</div>
        </div>
        <div className={s.actions}>
          <button className={s.btn_cancel} onClick={onClose}>Cancel</button>
          <button className={s.btn_save} onClick={handleSave} disabled={loading || !subject.trim()}>{loading ? 'Saving...' : 'Save Topic'}</button>
        </div>
      </div>
    </div>
  )
}
