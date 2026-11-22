import React, { useState } from 'react'
import { avatarColor, initials, timeAgo } from './store.js'

export function Avatar({ username, displayName, size = 36, src }) {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size, background: avatarColor(username), fontSize: Math.max(11, Math.round(size * 0.36)) }
  return <span className="avatar" style={style} aria-hidden="true">{src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : initials(displayName || username)}</span>
}

export function UserChip({ user, size = 24, bold = false }) {
  if (!user) return null
  return <a className="userchip" href={`#/kreator/${user.username}`} style={bold ? { fontWeight: 600 } : undefined}><Avatar username={user.username} displayName={user.displayName} src={user.avatar} size={size} /><span>{user.displayName}</span></a>
}

export function TagList({ tags }) {
  if (!tags?.length) return null
  return <div className="tags">{tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
}

export function WorkCard({ work, author, commentCount }) {
  return <a className="workcard" href={`#/karya/${work.id}`}>
    {work.image ? <img src={work.image} alt={work.title} loading="lazy" className="workcard-img" /> : <div className="workcard-img workcard-placeholder" aria-label={work.title}>{work.title.charAt(0)}</div>}
    <div className="workcard-body"><h3 className="workcard-title">{work.title}</h3><p className="workcard-author">oleh {author ? author.displayName : work.username}</p><div className="workcard-meta"><TagList tags={work.tags} /><span className="workcard-stats">♥ {work.likes.length} &nbsp;·&nbsp; {commentCount} kritik</span></div></div>
  </a>
}

export function CommentForm({ placeholder, submitLabel = 'Kirim', autoFocus = false, onSubmit, onCancel }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      if (await onSubmit(text.trim())) { setText(''); onCancel?.() }
    } finally { setBusy(false) }
  }
  return <form className="comment-form" onSubmit={submit}>
    <textarea value={text} autoFocus={autoFocus} placeholder={placeholder} rows={3} maxLength={2000} disabled={busy} onChange={(e) => setText(e.target.value)} aria-label={placeholder} />
    <div className="comment-form-actions">{onCancel && <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={onCancel}>Batal</button>}<button type="submit" className="btn btn-sm" disabled={!text.trim() || busy}>{busy ? 'Mengirim…' : submitLabel}</button></div>
  </form>
}

export function CommentNode({ comment, allComments, userMap, me, onReply, onDelete, depth = 0 }) {
  const [replying, setReplying] = useState(false)
  const children = allComments.filter((c) => c.parentId === comment.id)
  const author = userMap[comment.username]
  return <li className="comment" style={{ marginLeft: depth === 0 || depth > 3 ? 0 : 'clamp(12px, 3vw, 28px)' }}>
    <div className="comment-head"><UserChip user={author || { username: comment.username, displayName: comment.username }} bold /><time>{timeAgo(comment.createdAt)}</time></div>
    <p className="comment-text">{comment.text}</p>
    <div className="comment-actions"><button type="button" className="linkbtn" onClick={() => setReplying(!replying)}>Balas</button>{me === comment.username && <button type="button" className="linkbtn linkbtn-danger" onClick={() => onDelete(comment.id)}>Hapus</button>}</div>
    {replying && <CommentForm placeholder="Balas kritik ini dengan sopan…" autoFocus submitLabel="Kirim Balasan" onSubmit={(text) => onReply(comment.id, text)} onCancel={() => setReplying(false)} />}
    {children.length > 0 && <ul className="comment-children">{children.map((c) => <CommentNode key={c.id} comment={c} allComments={allComments} userMap={userMap} me={me} onReply={onReply} onDelete={onDelete} depth={depth + 1} />)}</ul>}
  </li>
}
