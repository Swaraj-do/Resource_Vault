import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'
import TopicCard from '../components/TopicCard'
import TopicModal from '../components/TopicModal'
import ResourceModal from '../components/ResourceModal'
import Toast from '../components/Toast'
import s from './DashboardPage.module.css'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [topicModal, setTopicModal] = useState({ open: false, topic: null })
  const [resourceModal, setResourceModal] = useState({ open: false, topicId: null, topicName: '' })

  const showToast = useCallback((msg) => {
    setToast(msg); setTimeout(() => setToast(null), 2600)
  }, [])

  const fetchTopics = useCallback(async () => {
    try {
      const res = await api.get('/api/topics')
      setTopics(res.data.topics)
    } catch { showToast('Failed to load topics') }
    finally { setLoading(false) }
  }, [showToast])

  useEffect(() => { fetchTopics() }, [fetchTopics])

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); document.getElementById('searchInput')?.focus() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const handleSaveTopic = async (data) => {
    try {
      if (topicModal.topic) {
        const res = await api.put(`/api/topics/${topicModal.topic._id}`, data)
        setTopics(p => p.map(t => t._id === topicModal.topic._id ? res.data.topic : t))
        showToast('✓ Topic updated')
      } else {
        const res = await api.post('/api/topics', data)
        setTopics(p => [res.data.topic, ...p])
        showToast('✓ Topic created')
      }
      setTopicModal({ open: false, topic: null })
    } catch (err) { showToast(err.response?.data?.error || 'Failed to save') }
  }

  const handleDeleteTopic = async (id) => {
    if (!window.confirm('Delete this topic and all its resources?')) return
    try {
      await api.delete(`/api/topics/${id}`)
      setTopics(p => p.filter(t => t._id !== id))
      showToast('🗑 Topic deleted')
    } catch { showToast('Failed to delete') }
  }

  const handleSaveResource = async ({ name, url }) => {
    try {
      const res = await api.post(`/api/topics/${resourceModal.topicId}/resources`, { name, url })
      setTopics(p => p.map(t => t._id === resourceModal.topicId ? res.data.topic : t))
      showToast('✓ Link added')
      setResourceModal({ open: false, topicId: null, topicName: '' })
    } catch (err) { showToast(err.response?.data?.error || 'Failed to add link') }
  }

  const handleDeleteResource = async (topicId, resId) => {
    try {
      const res = await api.delete(`/api/topics/${topicId}/resources/${resId}`)
      setTopics(p => p.map(t => t._id === topicId ? res.data.topic : t))
      showToast('🗑 Link removed')
    } catch { showToast('Failed to delete link') }
  }

  const handleUploadFiles = async (topicId, files) => {
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('files', f))
    try {
      const res = await api.post(`/api/uploads/${topicId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setTopics(p => p.map(t => t._id === topicId ? res.data.topic : t))
      showToast(`✓ ${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
    } catch (err) { showToast(err.response?.data?.error || 'Upload failed') }
  }

  const handleDeleteFile = async (topicId, fileId) => {
    try {
      const res = await api.delete(`/api/topics/${topicId}/files/${fileId}`)
      setTopics(p => p.map(t => t._id === topicId ? res.data.topic : t))
      showToast('🗑 File removed')
    } catch { showToast('Failed to delete file') }
  }

  const filtered = topics.filter(t =>
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.topic.toLowerCase().includes(search.toLowerCase())
  )

  // Group filtered topics by subject name (preserve insertion order of first seen)
  const groups = filtered.reduce((acc, t) => {
    const key = t.subject.trim()
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const cardProps = (topic) => ({
    key: topic._id,
    topic,
    onEdit: () => setTopicModal({ open: true, topic }),
    onDelete: () => handleDeleteTopic(topic._id),
    onAddResource: () => setResourceModal({ open: true, topicId: topic._id, topicName: topic.topic }),
    onDeleteResource: (rid) => handleDeleteResource(topic._id, rid),
    onUploadFiles: (files) => handleUploadFiles(topic._id, files),
    onDeleteFile: (fid) => handleDeleteFile(topic._id, fid),
  })

  return (
    <div className={s.page}>
      <div className={s.orb_a} /><div className={s.orb_b} />
      <header className={s.header}>
        <div className={s.logo}>
          <div className={s.logo_icon}>📚</div>
          <div className={s.logo_text}>Resource<span>Vault</span></div>
        </div>
        <div className={s.header_actions}>
          <input id="searchInput" type="text" className={s.search} placeholder="search topics... (⌘K)" value={search} onChange={e => setSearch(e.target.value)} />
          <button className={s.btn_primary} onClick={() => setTopicModal({ open: true, topic: null })}>+ New Topic</button>
          <div className={s.user_menu}>
            <div className={s.welcome}>
              <span className={s.welcome_label}>Welcome back,</span>
              <span className={s.welcome_name}>{user?.email?.split('@')[0]}</span>
            </div>
            <div className={s.avatar}>{user?.email?.[0]?.toUpperCase()}</div>
            <button className={s.btn_outline} onClick={logout}>Logout</button>
          </div>
        </div>
      </header>

      <main className={s.main}>
        <div className={s.section_header}>
          <div className={s.section_title}>Your Vault</div>
          <div className={s.count_badge}>{Object.keys(groups).length} subject{Object.keys(groups).length !== 1 ? 's' : ''} · {topics.length} card{topics.length !== 1 ? 's' : ''}</div>
        </div>

        {loading ? (
          <div className={s.loading}>Loading your vault...</div>
        ) : topics.length === 0 ? (
          <div className={s.empty_state}>
            <div className={s.empty_icon}>📚</div>
            <div className={s.empty_title}>Your vault is empty</div>
            <div className={s.empty_sub}>Create your first topic to start saving resources</div>
            <button className={s.btn_primary} onClick={() => setTopicModal({ open: true, topic: null })}>+ New Topic</button>
          </div>
        ) : (
          <div className={s.groups_container}>
            {Object.entries(groups).map(([subjectName, subjectTopics]) => (
              <div key={subjectName} className={s.subject_group}>
                <div className={s.group_header}>
                  <div className={s.group_title_row}>
                    <h2 className={s.group_title}>{subjectName}</h2>
                    <div className={s.group_pill}>{subjectTopics.length} card{subjectTopics.length !== 1 ? 's' : ''}</div>
                  </div>
                  <button
                    className={s.group_add_btn}
                    onClick={() => setTopicModal({ open: true, topic: null })}
                    title={`Add card to ${subjectName}`}
                  >+ Add Card</button>
                </div>
                <div className={s.grid}>
                  {subjectTopics.map(topic => (
                    <TopicCard {...cardProps(topic)} />
                  ))}
                </div>
              </div>
            ))}

            {/* Global add button at bottom */}
            <div className={s.bottom_add}>
              <div className={s.add_card} onClick={() => setTopicModal({ open: true, topic: null })}>
                <div className={s.plus}>+</div>
                <span>New Subject / Card</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <TopicModal open={topicModal.open} topic={topicModal.topic} onClose={() => setTopicModal({ open: false, topic: null })} onSave={handleSaveTopic} />
      <ResourceModal open={resourceModal.open} topicName={resourceModal.topicName} onClose={() => setResourceModal({ open: false, topicId: null, topicName: '' })} onSave={handleSaveResource} />
      {toast && <Toast message={toast} />}
    </div>
  )
}
