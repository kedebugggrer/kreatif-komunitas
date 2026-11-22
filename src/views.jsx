import React, { useEffect, useState } from 'react'
import { Avatar, CommentForm, CommentNode, TagList, UserChip, WorkCard } from './components.jsx'
import { timeAgo, workCategory } from './store.js'
import { categories, validateImage } from './api.js'

export function Explore({ state, userMap, commentCounts }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua')
  const [sort, setSort] = useState('newest')
  const search = query.trim().toLocaleLowerCase('id-ID')
  const works = state.works.filter((w) => (category === 'Semua' || workCategory(w) === category) &&
    [w.title, w.description, w.username, userMap[w.username]?.displayName, ...w.tags].join(' ').toLocaleLowerCase('id-ID').includes(search))
    .sort((a, b) => sort === 'popular' ? b.likes.length - a.likes.length || new Date(b.createdAt) - new Date(a.createdAt) : new Date(b.createdAt) - new Date(a.createdAt))
  const activeCreators = state.users.filter((u) => `${u.username} ${u.displayName}`.toLocaleLowerCase('id-ID').includes(search))
    .map((u) => ({ ...u, workCount: state.works.filter((w) => w.username === u.username).length }))
    .sort((a, b) => b.workCount - a.workCount)
  const reset = () => { setQuery(''); setCategory('Semua'); setSort('newest') }
  return <>
    <section className="hero">
      <p className="eyebrow">Portofolio &amp; Kritik Terbuka</p>
      <h1 className="hero-title">Tunjukkan karyamu, terima masukan yang jujur</h1>
      <p className="hero-body">Unggah portofoliomu, bagikan ke komunitas, dan dapatkan kritik membangun langsung di halaman karyamu. Setiap profil jadi ruang pamer pribadimu.</p>
      <div className="hero-actions"><a className="btn" href="#/unggah">Mulai Unggah Karya</a><a className="btn btn-ghost" href="#karya-terbaru">Jelajahi Karya</a></div>
    </section>
    <section id="karya-terbaru" className="section">
      <div className="section-head"><p className="eyebrow">Dari meja kerja komunitas</p><h2>Temukan sudut pandang baru</h2><p>Cari inspirasi, kenali kreatornya, dan mulai percakapan.</p></div>
      <div className="explore-toolbar">
        <label className="search-field">Cari karya atau kreator<input type="search" placeholder="Judul, tag, atau @username" value={query} onChange={(e) => setQuery(e.target.value.replace(/^@/, ''))} /></label>
        <label>Urutkan<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="newest">Terbaru</option><option value="popular">Paling disukai</option></select></label>
      </div>
      <div className="filter-row" role="group" aria-label="Filter kategori">{['Semua', ...categories].map((item) => <button key={item} className={`filter-chip ${category === item ? 'selected' : ''}`} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <p className="result-count" role="status">{works.length} karya ditemukan{search ? ` untuk “${query.trim()}”` : ''}</p>
      {works.length ? <div className="workgrid">{works.map((w) => <WorkCard key={w.id} work={w} author={userMap[w.username]} commentCount={commentCounts[w.id] || 0} />)}</div> : <div className="empty"><h3>{state.works.length ? 'Belum ada yang cocok' : 'Ruang ini menunggu karya pertamamu'}</h3><p>{state.works.length ? 'Coba judul, nama kreator, atau kategori lain.' : 'Bagikan proses kreatifmu dan undang masukan dari komunitas.'}</p>{state.works.length ? <button className="btn btn-ghost btn-sm" onClick={reset}>Reset pencarian</button> : <a className="btn btn-sm" href="#/unggah">Unggah karya pertama</a>}</div>}
    </section>
    <section className="section"><div className="section-head"><h2>Kenali kreatornya</h2><p>Di balik setiap karya, ada proses yang layak didengar.</p></div>
      {activeCreators.length ? <div className="creatorrow">{activeCreators.map((u) => <a key={u.username} className="creatorcard" href={`#/kreator/${u.username}`}><Avatar username={u.username} displayName={u.displayName} src={u.avatar} size={44} /><span className="creatorcard-name">{u.displayName}</span><span className="creatorcard-username">@{u.username}</span><span className="creatorcard-meta">{u.workCount} karya · sejak {new Date(u.joined).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span></a>)}</div> : <p className="empty">Belum ada kreator yang cocok dengan pencarianmu.</p>}
    </section>
  </>
}

export function WorkDetail({ workId, state, userMap, me, actions }) {
  const [imageIndex, setImageIndex] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const work = state.works.find((w) => w.id === workId)
  if (!work) return <section className="section narrow"><h2>Karya tidak ditemukan</h2><p>Tautan ini mungkin sudah tidak berlaku.</p><a className="btn btn-ghost" href="#/">Kembali ke Jelajah</a></section>
  const images = work.images || (work.image ? [work.image] : [])
  const comments = state.comments.filter((c) => c.workId === work.id)
  const liked = me && work.likes.includes(me)
  return <article className="section narrow workdetail">
    <a className="linkbtn backlink" href="#/">← Kembali ke Jelajah</a>
    {images.length > 0 && <img className="workdetail-img" src={images[imageIndex] || images[0]} alt={`${work.title} — gambar ${imageIndex + 1}`} />}
    {images.length > 1 && <div className="image-strip" aria-label="Galeri gambar">{images.map((image, i) => <button key={image} className="image-thumb" aria-label={`Lihat gambar ${i + 1}`} aria-pressed={imageIndex === i} onClick={() => setImageIndex(i)}><img src={image} alt="" /></button>)}</div>}
    <header className="workdetail-head"><p className="eyebrow">{work.category || 'Portofolio kreator'}</p><h1>{work.title}</h1><div className="workdetail-byline"><UserChip user={userMap[work.username]} size={32} bold /><span className="muted">· {timeAgo(work.createdAt)}</span></div>
      <div className="workdetail-actions"><button className={`btn btn-sm ${liked ? '' : 'btn-ghost'}`} disabled={actions.busy} onClick={() => actions.toggleLike(work.id)} aria-pressed={!!liked}>♥ Suka · {work.likes.length}</button>
        {me === work.username && <><a className="btn btn-ghost btn-sm" href={`#/edit/${work.id}`}>Edit karya</a><button className="linkbtn linkbtn-danger" onClick={() => setConfirmDelete(true)}>Hapus karya</button></>}
      </div>
    </header>
    {confirmDelete && <div className="notice" role="region" aria-label="Konfirmasi hapus karya"><p>Hapus “{work.title}”? Komentar dan apresiasi karya ini ikut dihapus. Tindakan ini tidak bisa dibatalkan.</p><div className="comment-form-actions"><button className="btn btn-ghost btn-sm" disabled={actions.busy} onClick={() => setConfirmDelete(false)}>Batal</button><button className="btn btn-sm" disabled={actions.busy} onClick={() => actions.deleteWork(work.id)}>{actions.busy ? 'Menghapus…' : 'Ya, hapus karya'}</button></div></div>}
    <p className="workdetail-desc">{work.description}</p><TagList tags={work.tags} />
    <section className="critique"><div className="section-head"><h2>Kritik &amp; Percakapan <span className="badge">{comments.length}</span></h2><p>Berikan masukan yang spesifik dan membangun. Hargai proses kreatornya.</p></div>
      {me ? <CommentForm placeholder="Bagian mana yang menarik? Apa yang bisa dikembangkan?" submitLabel="Kirim Kritik" onSubmit={(text) => actions.addComment(work.id, null, text)} /> : <p className="notice"><a href="#/" onClick={actions.openSignIn}>Masuk atau daftar</a> untuk ikut memberi kritik.</p>}
      {comments.length ? <ul className="comment-list">{comments.filter((c) => !c.parentId).map((c) => <CommentNode key={c.id} comment={c} allComments={comments} userMap={userMap} me={me} onReply={(parent, text) => actions.addComment(work.id, parent, text)} onDelete={actions.deleteComment} />)}</ul> : <p className="empty">Belum ada kritik. Jadilah yang pertama membuka percakapan.</p>}
    </section>
  </article>
}

export function Profile({ username, state, userMap, me, actions }) {
  const user = userMap[username]
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: user?.displayName || '', bio: user?.bio || '', website: user?.website || '', avatarFile: null })
  const [error, setError] = useState('')
  if (!user) return <section className="section narrow"><h2>Kreator tidak ditemukan</h2><a className="btn btn-ghost" href="#/">Kembali ke Jelajah</a></section>
  const works = state.works.filter((w) => w.username === username).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const mine = me === username
  async function submit(e) {
    e.preventDefault()
    if (!form.displayName.trim()) { setError('Nama tampilan tidak boleh kosong.'); return }
    if (form.website && !/^https:\/\/[^\s]+$/i.test(form.website.trim())) { setError('Gunakan tautan lengkap yang diawali https://.'); return }
    setError('')
    if (await actions.updateProfile(form)) setEditing(false)
  }
  return <section className="section">
    <div className="profile-head"><Avatar username={username} displayName={user.displayName} src={user.avatar} size={80} /><div className="profile-id"><p className="eyebrow">Ruang pamer kreator</p><h1>{user.displayName}</h1><p className="muted">@{username} · Bergabung {new Date(user.joined).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p></div>{mine && <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(!editing); setError(''); setForm({ displayName: user.displayName, bio: user.bio, website: user.website || '', avatarFile: null }) }}>{editing ? 'Batal edit' : 'Edit profil'}</button>}</div>
    {user.bio && <p className="profile-bio">{user.bio}</p>}{user.website?.startsWith('https://') && <a className="profile-website" href={user.website} target="_blank" rel="noopener noreferrer">Kunjungi tautan kreator ↗</a>}
    {editing && <form className="profile-edit" onSubmit={submit}><label>Nama tampilan<input value={form.displayName} maxLength={60} required onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></label><label>Bio<textarea rows={3} maxLength={500} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label><label>Tautan website atau media sosial<input type="url" value={form.website} placeholder="https://..." onChange={(e) => setForm({ ...form, website: e.target.value })} /></label><label>Foto profil (JPG, PNG, WebP · maksimal 3 MB)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files[0]; if (!file) return; try { validateImage(file); setForm({ ...form, avatarFile: file }); setError('') } catch (err) { setError(err.message); e.target.value = ''; setForm({ ...form, avatarFile: null }) } }} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="btn" disabled={actions.busy}>{actions.busy ? 'Menyimpan…' : 'Simpan profil'}</button></form>}
    <dl className="profile-stats"><div><dt>Karya</dt><dd>{works.length}</dd></div><div><dt>Apresiasi</dt><dd>{works.reduce((total, w) => total + w.likes.length, 0)}</dd></div><div><dt>Kritik ditulis</dt><dd>{state.comments.filter((c) => c.username === username).length}</dd></div></dl>
    <h2 className="profile-gallery-title">Galeri karya</h2>{works.length ? <div className="workgrid">{works.map((w) => <WorkCard key={w.id} work={w} author={user} commentCount={state.comments.filter((c) => c.workId === w.id).length} />)}</div> : <p className="empty">Belum ada karya di ruang pamer ini.</p>}{mine && <a href="#/unggah" className="btn profile-upload">Unggah karya baru</a>}
  </section>
}

function FilePreview({ file, remove }) {
  const [url, setUrl] = useState('')
  useEffect(() => { const next = URL.createObjectURL(file); setUrl(next); return () => URL.revokeObjectURL(next) }, [file])
  return <div className="upload-tile"><img src={url || undefined} alt={`Pratinjau ${file.name}`} /><button type="button" className="linkbtn" onClick={remove}>Hapus {file.name}</button></div>
}

export function Upload({ me, actions, work }) {
  const [form, setForm] = useState({ title: work?.title || '', description: work?.description || '', tags: work?.tags.join(', ') || '', category: work?.category || 'Lainnya' })
  const [images, setImages] = useState(work?.images || [])
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  if (!me) return <section className="section narrow"><p className="eyebrow">Bagikan proses kreatifmu</p><h1 className="page-title">Masuk dulu untuk mengunggah</h1><p className="notice"><a href="#/" onClick={actions.openSignIn}>Masuk atau daftar</a> dengan email dan kata sandi untuk menerbitkan karya atas namamu.</p><a className="linkbtn backlink" href="#/">← Kembali menjelajah</a></section>
  function pickImages(e) {
    const selected = [...e.target.files]
    try {
      if (images.length + files.length + selected.length > 5) throw new Error('Maksimal 5 gambar per karya.')
      selected.forEach(validateImage)
      setFiles([...files, ...selected])
      setError('')
    } catch (err) { setError(err.message) }
    e.target.value = ''
  }
  async function submit(e) {
    e.preventDefault()
    const tags = [...new Set(form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))]
    if (!form.title.trim()) { setError('Judul karya tidak boleh kosong.'); return }
    if (tags.length > 5 || tags.join(',').length > 150) { setError('Gunakan maksimal 5 tag, total maksimal 150 karakter.'); return }
    if (!images.length && !files.length) { setError('Tambahkan setidaknya satu gambar karya.'); return }
    setError('')
    await actions.addWork({ ...form, tags, images, files }, work)
  }
  return <section className="section narrow"><p className="eyebrow">Dari proses, menjadi percakapan</p><h1 className="page-title">{work ? 'Edit karya' : 'Unggah Karya Baru'}</h1><p className="muted">Terbitkan sebagai <strong>@{me}</strong>. Ceritakan proses dan masukan yang kamu cari.</p>
    <form className="upload-form" onSubmit={submit}><fieldset disabled={actions.busy}>
      <label>Judul karya<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} required placeholder="mis. Sunyi di Ruang Ketiga" /></label>
      <label>Deskripsi &amp; pertanyaan untuk kritikus<textarea rows={5} value={form.description} maxLength={5000} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ceritakan proses, material, dan bagian yang ingin kamu kembangkan…" /></label>
      <label>Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label>Tag (pisahkan dengan koma, maksimal 5)<input value={form.tags} maxLength={150} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="lukis abstrak, akrilik" /></label>
      <label>Gambar karya (1–5 gambar, maksimal 3 MB per gambar)<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={pickImages} /></label><p className="muted">JPG, PNG, atau WebP. Gambar pertama menjadi sampul karya.</p>
      <div className="upload-gallery">{images.map((image, i) => <div className="upload-tile" key={image}><img src={image} alt={`Gambar karya ${i + 1}`} /><button type="button" className="linkbtn" onClick={() => setImages(images.filter((_, index) => i !== index))}>Hapus gambar {i + 1}</button></div>)}{files.map((file, i) => <FilePreview key={`${file.name}-${i}`} file={file} remove={() => setFiles(files.filter((_, index) => i !== index))} />)}</div>
      {error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button type="submit" className="btn" disabled={!form.title.trim() || (!images.length && !files.length)}>{actions.busy ? 'Menyimpan karya…' : work ? 'Simpan perubahan' : 'Unggah & Minta Kritik'}</button><a className="btn btn-ghost" href={work ? `#/karya/${work.id}` : '#/'}>Batal</a></div>
    </fieldset></form>
  </section>
}
