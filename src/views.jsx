import React, { useState } from 'react'
import { Avatar, CommentForm, CommentNode, TagList, UserChip, WorkCard } from './components.jsx'
import { timeAgo } from './store.js'

export function Explore({ state, userMap, commentCounts }) {
  const works = [...state.works].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const activeCreators = state.users
    .map((u) => ({
      ...u,
      workCount: state.works.filter((w) => w.username === u.username).length
    }))
    .sort((a, b) => b.workCount - a.workCount)

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Portofolio &amp; Kritik Terbuka</p>
        <h1 className="hero-title">Tunjukkan karyamu, terima masukan yang jujur</h1>
        <p className="hero-body">
          Unggah portofoliomu, bagikan ke komunitas, dan dapatkan kritik membangun langsung di halaman
          kerjamu. Setiap profil jadi ruang pamer pribadimu.
        </p>
        <div className="hero-actions">
          <a className="btn" href="#/unggah">
            Mulai Unggah Karya
          </a>
          <a className="btn btn-ghost" href="#karya-terbaru">
            Jelajahi Karya
          </a>
        </div>
      </section>

      <section id="karya-terbaru" className="section">
        <div className="section-head">
          <h2>Karya Terbaru</h2>
          <p>Karya yang paling baru meminta kritik dari komunitas.</p>
        </div>
        <div className="workgrid">
          {works.map((w) => (
            <WorkCard key={w.id} work={w} author={userMap[w.username]} commentCount={commentCounts[w.id] || 0} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Kreator Aktif</h2>
          <p>Temukan kreator baru dan lihat ruang pamer pribadi mereka.</p>
        </div>
        <div className="creatorrow">
          {activeCreators.map((u) => (
            <a key={u.username} className="creatorcard" href={`#/kreator/${u.username}`}>
              <Avatar username={u.username} displayName={u.displayName} size={44} />
              <span className="creatorcard-name">{u.displayName}</span>
              <span className="creatorcard-username">@{u.username}</span>
              <span className="creatorcard-meta">
                {u.workCount} karya · sejak {new Date(u.joined).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

export function WorkDetail({ workId, state, userMap, me, actions }) {
  const work = state.works.find((w) => w.id === workId)
  if (!work) {
    return (
      <section className="section narrow">
        <h2>Karya tidak ditemukan</h2>
        <p>Tautan ini mungkin sudah tidak berlaku.</p>
        <a className="btn btn-ghost" href="#/">
          Kembali ke Jelajah
        </a>
      </section>
    )
  }
  const author = userMap[work.username]
  const comments = state.comments.filter((c) => c.workId === work.id)
  const roots = comments.filter((c) => !c.parentId)
  const liked = me && work.likes.includes(me)

  const submitComment = (parentId, text) => actions.addComment(work.id, parentId, text)
  const like = () => actions.toggleLike(work.id)

  return (
    <article className="section narrow workdetail">
      <a className="linkbtn backlink" href="#/">
        ← Kembali ke Jelajah
      </a>
      {work.image ? (
        <img className="workdetail-img" src={work.image} alt={work.title} />
      ) : (
        <div className="workdetail-img workcard-placeholder">{work.title.charAt(0)}</div>
      )}
      <header className="workdetail-head">
        <h1>{work.title}</h1>
        <div className="workdetail-byline">
          <UserChip user={author} size={32} bold />
          <span className="muted">· {timeAgo(work.createdAt)}</span>
        </div>
        <div className="workdetail-actions">
          <button className={`btn btn-sm ${liked ? '' : 'btn-ghost'}`} onClick={like} aria-pressed={!!liked}>
            ♥ Suka · {work.likes.length}
          </button>
        </div>
      </header>
      <p className="workdetail-desc">{work.description}</p>
      <TagList tags={work.tags} />

      <section className="critique">
        <h2>Kritik &amp; Masukan <span className="countbadge">{comments.length}</span></h2>
        {me ? (
          <CommentForm
            placeholder="Tulis kritik yang membangun — apa yang berhasil, apa yang bisa dicoba…"
            submitLabel="Kirim Kritik"
            onSubmit={(text) => submitComment(null, text)}
          />
        ) : (
          <p className="notice">
            <a href="#/" onClick={actions.openSignIn}>
              Masuk atau daftar
            </a>{' '}
            untuk memberi kritik pada karya ini.
          </p>
        )}
        {roots.length === 0 ? (
          <p className="empty">Belum ada kritik. Jadilah yang pertama memberi masukan yang jujur.</p>
        ) : (
          <ul className="comment-list">
            {roots.map((c) => (
              <CommentNode
                key={c.id}
                comment={c}
                allComments={comments}
                userMap={userMap}
                me={me}
                onReply={submitComment}
                onDelete={actions.deleteComment}
              />
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}

export function Profile({ username, state, userMap, me, actions }) {
  const user = userMap[username]
  if (!user) {
    return (
      <section className="section narrow">
        <h2>Kreator tidak ditemukan</h2>
        <p>Username @{username} belum terdaftar di komunitas ini.</p>
        <a className="btn btn-ghost" href="#/">
          Kembali ke Jelajah
        </a>
      </section>
    )
  }
  const works = state.works
    .filter((w) => w.username === username)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const commentsGiven = state.comments.filter((c) => c.username === username).length
  const likesReceived = state.works
    .filter((w) => w.username === username)
    .reduce((sum, w) => sum + w.likes.length, 0)
  const own = me === username
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: user.displayName, bio: user.bio })

  const save = (e) => {
    e.preventDefault()
    actions.updateProfile({
      displayName: form.displayName.trim() || user.username,
      bio: form.bio.trim()
    })
    setEditing(false)
  }

  return (
    <section className="section narrow profile">
      <header className="profile-head">
        <Avatar username={user.username} displayName={user.displayName} size={72} />
        <div className="profile-id">
          <h1>{user.displayName}</h1>
          <p className="muted">@{user.username} · bergabung {new Date(user.joined).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
        {own && !editing && (
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
            Sunting Profil
          </button>
        )}
      </header>

      {editing ? (
        <form className="profile-edit" onSubmit={save}>
          <label>
            Nama tampilan
            <input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              required
            />
          </label>
          <label>
            Bio
            <textarea
              rows={3}
              value={form.bio}
              placeholder="Ceritakan singkat tentang karyamu…"
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </label>
          <div className="comment-form-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
              Batal
            </button>
            <button type="submit" className="btn btn-sm">
              Simpan
            </button>
          </div>
        </form>
      ) : (
        user.bio && <p className="profile-bio">{user.bio}</p>
      )}

      <dl className="profile-stats">
        <div>
          <dt>Karya</dt>
          <dd>{works.length}</dd>
        </div>
        <div>
          <dt>Kritik diberi</dt>
          <dd>{commentsGiven}</dd>
        </div>
        <div>
          <dt>Suka diterima</dt>
          <dd>{likesReceived}</dd>
        </div>
      </dl>

      <h2 className="profile-gallery-title">Galeri Karya</h2>
      {works.length === 0 ? (
        <p className="empty">
          {own ? 'Belum ada karya. Unggah karya pertamamu dan minta kritik pertama.' : 'Kreator ini belum mengunggah karya.'}
        </p>
      ) : (
        <div className="workgrid">
          {works.map((w) => {
            const count = state.comments.filter((c) => c.workId === w.id).length
            return <WorkCard key={w.id} work={w} author={user} commentCount={count} />
          })}
        </div>
      )}
      {own && works.length > 0 && (
        <a className="btn btn-ghost profile-upload" href="#/unggah">
          Unggah Karya Baru
        </a>
      )}
    </section>
  )
}

export function Upload({ me, userMap, actions }) {
  const [form, setForm] = useState({ title: '', description: '', tags: '' })
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')

  if (!me) {
    return (
      <section className="section narrow">
        <h2>Masuk dulu untuk mengunggah</h2>
        <p className="notice">
          <a href="#/" onClick={actions.openSignIn}>
            Masuk atau daftar
          </a>{' '}
          dengan username-mu, lalu karyamu bisa langsung dikritik komunitas.
        </p>
      </section>
    )
  }

  const pickImage = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (file.size > 3_000_000) {
      setError('Ukuran gambar maksimal 3 MB. Silakan kompres dulu.')
      e.target.value = ''
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result))
    reader.readAsDataURL(file)
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const tags = form.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5)
    actions.addWork({ ...form, tags, image })
  }

  return (
    <section className="section narrow">
      <h1 className="page-title">Unggah Karya Baru</h1>
      <p className="muted">
        Unggah sebagai <strong>@{me}</strong>. Komunitas akan memberi kritik langsung di halaman karyamu.
      </p>
      <form className="upload-form" onSubmit={submit}>
        <label>
          Judul karya
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="mis. Sunyi di Ruang Ketiga"
            required
          />
        </label>
        <label>
          Deskripsi &amp; pertanyaan untuk kritikus
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ceritakan proses, material, dan bagian mana yang paling ingin kamu dapatkan masukan…"
          />
        </label>
        <label>
          Tag (pisahkan dengan koma, maksimal 5)
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="lukis abstrak, akrilik"
          />
        </label>
        <label>
          Gambar karya (maksimal 3 MB)
          <input type="file" accept="image/*" onChange={pickImage} />
        </label>
        {image && (
          <img src={image} alt="Pratinjau karya" className="upload-preview" />
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="btn" disabled={!form.title.trim()}>
          Unggah &amp; Minta Kritik
        </button>
      </form>
    </section>
  )
}
