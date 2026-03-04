import { useState, useRef } from 'react'
import s from './TopicCard.module.css'

const API_BASE = import.meta.env.VITE_API_URL || ''

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function fileIcon(mimetype) {
  if (mimetype === 'application/pdf') return '📄'
  if (mimetype.includes('word')) return '📝'
  if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return '📊'
  if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📈'
  if (mimetype.includes('text')) return '📃'
  return '📎'
}

export default function TopicCard({ topic, onEdit, onDelete, onAddResource, onDeleteResource, onUploadFiles, onDeleteFile }) {
  const [flipped, setFlipped] = useState(false)
  const [activeTab, setActiveTab] = useState('links') // 'links' | 'files'
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  const getFavicon = (url) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` }
    catch { return null }
  }

  const handleFileUpload = async (files) => {
    if (!files?.length) return
    setUploading(true)
    await onUploadFiles(files)
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  return (
    <div
      className={`${s.card} ${s[`color_${topic.color}`]} ${flipped ? s.flipped : ''}`}
      onClick={() => !flipped && setFlipped(true)}
    >
      <div className={s.inner}>

        {/* ── FRONT ── */}
        <div className={`${s.face} ${s.front}`}>
          <div className={s.front_top}>
            <div className={s.emoji}>{topic.emoji}</div>
            <div className={s.menu} onClick={e => e.stopPropagation()}>
              <button className={s.icon_btn} onClick={onEdit} title="Edit">✎</button>
              <button className={`${s.icon_btn} ${s.del}`} onClick={onDelete} title="Delete">🗑</button>
            </div>
          </div>
          {topic.topic !== topic.subject
            ? <><div className={s.topic_name}>{topic.topic}</div><div className={s.subject_name}>{topic.subject}</div></>
            : <div className={s.topic_name}>{topic.topic}</div>
          }
          <div className={s.front_footer}>
            <div className={s.counts}>
              <span><strong>{topic.resources.length}</strong> link{topic.resources.length !== 1 ? 's' : ''}</span>
              <span className={s.dot}>·</span>
              <span><strong>{topic.files.length}</strong> file{topic.files.length !== 1 ? 's' : ''}</span>
            </div>
            <div className={s.flip_hint}>flip ↺</div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div className={`${s.face} ${s.back}`} onClick={e => e.stopPropagation()}>

          {/* Back header */}
          <div className={s.back_top}>
            <div className={s.back_title}>{topic.topic}</div>
            <button className={s.close_btn} onClick={() => setFlipped(false)} title="Flip back">↩</button>
          </div>

          {/* Tabs */}
          <div className={s.tabs}>
            <button
              className={`${s.tab} ${activeTab === 'links' ? s.tab_active : ''}`}
              onClick={() => setActiveTab('links')}
            >
              🔗 Links {topic.resources.length > 0 && <span className={s.tab_count}>{topic.resources.length}</span>}
            </button>
            <button
              className={`${s.tab} ${activeTab === 'files' ? s.tab_active : ''}`}
              onClick={() => setActiveTab('files')}
            >
              📁 Files {topic.files.length > 0 && <span className={s.tab_count}>{topic.files.length}</span>}
            </button>
          </div>

          {/* ── LINKS TAB ── */}
          {activeTab === 'links' && (
            <div className={s.tab_body}>
              <div className={s.tab_action_row}>
                <button className={s.add_btn} onClick={onAddResource}>+ Add Link</button>
              </div>
              <div className={s.scroll_area}>
                {topic.resources.length === 0 ? (
                  <div className={s.empty}>No links yet.<br />Click "+ Add Link" to start.</div>
                ) : (
                  topic.resources.map(r => {
                    const fav = getFavicon(r.url)
                    return (
                      <div key={r._id} className={s.res_item}>
                        <div className={s.favicon}>
                          {fav ? <img src={fav} alt="" onError={e => e.target.style.display='none'} /> : '🔗'}
                        </div>
                        <div className={s.res_info}>
                          <span className={s.res_name}>{r.name}</span>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className={s.res_url} onClick={e => e.stopPropagation()}>{r.url}</a>
                        </div>
                        <div className={s.res_actions}>
                          <button className={s.res_btn} onClick={() => window.open(r.url,'_blank')} title="Open">↗</button>
                          <button className={`${s.res_btn} ${s.res_del}`} onClick={() => onDeleteResource(r._id)} title="Delete">✕</button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* ── FILES TAB ── */}
          {activeTab === 'files' && (
            <div className={s.tab_body}>
              <div className={s.tab_action_row}>
                <button className={s.add_btn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading...' : '+ Upload Files'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md"
                  style={{ display: 'none' }}
                  onChange={e => handleFileUpload(e.target.files)}
                />
              </div>

              {/* Drop zone */}
              <div
                className={`${s.drop_zone} ${dragging ? s.dragging : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <span>{dragging ? '📂 Drop to upload' : '📂 Drag & drop files here'}</span>
                <small>PDF, Word, PPT, Excel, TXT · max 20MB each</small>
              </div>

              <div className={s.scroll_area}>
                {topic.files.length === 0 ? (
                  <div className={s.empty}>No files yet.<br />Upload PDFs, docs, slides and more.</div>
                ) : (
                  topic.files.map(f => (
                    <div key={f._id} className={s.file_item}>
                      <div className={s.file_icon}>{fileIcon(f.mimetype)}</div>
                      <div className={s.file_info}>
                        <span className={s.file_name}>{f.originalName}</span>
                        <span className={s.file_size}>{formatBytes(f.size)}</span>
                      </div>
                      <div className={s.res_actions}>
                        <a
                          href={`${API_BASE}${f.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.res_btn}
                          title="Open"
                          onClick={e => e.stopPropagation()}
                        >↗</a>
                        <button className={`${s.res_btn} ${s.res_del}`} onClick={() => onDeleteFile(f._id)} title="Delete">✕</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
