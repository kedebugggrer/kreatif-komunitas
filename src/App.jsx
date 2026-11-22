import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar } from './components.jsx'
import { Explore, Profile, Upload, WorkDetail } from './views.jsx'
import { isValidUsername, normalizeUsername, seedUsers, seedWorks, seedComments } from './store.js'
import { errorMessage, fetchCommunity, mutate, online, saveWork, supabase, uploadImage } from './api.js'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return useMemo(() => {
    const segments = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
    if (segments[0] === 'karya' && segments[1]) return { name: 'work', id: segments[1] }
    if (segments[0] === 'edit' && segments[1]) return { name: 'edit', id: segments[1] }
    if (segments[0] === 'kreator' && segments[1]) return { name: 'profile', username: segments[1].toLowerCase() }
    if (segments[0] === 'unggah') return { name: 'upload' }
    return { name: 'home' }
  }, [hash])
}

function AuthDialog({ close }) {
  const dialog = useRef(null)
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => { dialog.current.showModal() }, [])
  async function submit(e) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const username = normalizeUsername(data.get('username'))
    if (mode === 'register' && !isValidUsername(username)) {
      setError('Username harus 3–20 huruf kecil, angka, atau garis bawah.')
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const credentials = { email: data.get('email').trim(), password: data.get('password') }
      const result = mode === 'register'
        ? await supabase.auth.signUp({ ...credentials, options: { data: { username } } })
        : await supabase.auth.signInWithPassword(credentials)
      if (result.error) throw result.error
      if (result.data.session) close()
      else setMessage('Periksa email untuk konfirmasi akun, lalu kembali ke sini untuk masuk.')
    } catch (err) { setError(errorMessage(err)) }
    finally { setBusy(false) }
  }
  return <dialog ref={dialog} className="dialog auth-dialog" onCancel={close} onClose={close} aria-labelledby="auth-title">
    <form onSubmit={submit}>
      <h2 id="auth-title">{online ? mode === 'register' ? 'Buat ruang kreatifmu' : 'Selamat datang kembali' : 'Komunitas online belum aktif'}</h2>
      {!online ? <p className="muted">Ini pratinjau desain. Login, unggah, dan komentar akan tersedia setelah layanan akun dan penyimpanan online terhubung. Tidak ada akun yang dibuat dari username saja.</p> : <>
        <p className="muted">{mode === 'register' ? 'Satu akun untuk karya dan percakapanmu.' : 'Masuk dengan email dan kata sandi, bukan username saja.'}</p>
        {mode === 'register' && <label>Username<input name="username" required minLength={3} maxLength={20} autoComplete="username" placeholder="mis. ruangrara" /></label>}
        <label>Email<input name="email" type="email" required autoComplete="email" /></label>
        <label>Kata sandi<input name="password" type="password" minLength={8} required autoComplete={mode === 'register' ? 'new-password' : 'current-password'} /></label>
        <p className="muted">Minimal 8 karakter. Jangan gunakan kata sandi yang dipakai di layanan lain.</p>
        {error && <p role="alert" className="form-error">{error}</p>}
        {message && <p role="status" className="notice">{message}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Memproses…' : mode === 'register' ? 'Daftar' : 'Masuk ke akun'}</button>
        <button type="button" className="linkbtn auth-switch" disabled={busy} onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setMessage('') }}>{mode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}</button>
      </>}
      <div className="comment-form-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={close}>Tutup</button></div>
    </form>
  </dialog>
}

export default function App() {
  const [state, setState] = useState(() => online ? { users: [], works: [], comments: [] } : { users: seedUsers, works: seedWorks, comments: seedComments })
  const [session, setSession] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [loading, setLoading] = useState(online)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const route = useHashRoute()
  const currentUser = session?.user?.id ? state.users.find((u) => u.id === session.user.id) : null
  const me = currentUser?.username || null
  async function reload() {
    setLoading(true)
    setError('')
    try { setState(await fetchCommunity()) }
    catch (err) { setError(errorMessage(err)) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    if (!online) return
    reload()
    supabase.auth.getSession().then(({ data, error: err }) => { if (err) setError(errorMessage(err)); else setSession(data.session) })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => { setSession(next) })
    return () => data.subscription.unsubscribe()
  }, [])
  useEffect(() => { if (session?.user?.id) reload() }, [session?.user?.id])
  useEffect(() => { window.scrollTo(0, 0) }, [route])
  const userMap = useMemo(() => Object.fromEntries(state.users.map((u) => [u.username, u])), [state.users])
  const commentCounts = useMemo(() => state.comments.reduce((acc, c) => ({ ...acc, [c.workId]: (acc[c.workId] || 0) + 1 }), {}), [state.comments])
  const openSignIn = (e) => { e?.preventDefault(); setAuthOpen(true) }
  async function run(operation, success) {
    if (!me) { openSignIn(); return false }
    if (busy) return false
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await operation()
      setNotice(success)
      try { setState(await fetchCommunity()) }
      catch { setError('Perubahan tersimpan, tetapi tampilan belum diperbarui. Muat ulang data sebelum mengirim lagi.') }
      return true
    } catch (err) { setError(errorMessage(err)); return false }
    finally { setBusy(false) }
  }
  const actions = {
    openSignIn, busy,
    signOut: async () => {
      const { error: err } = await supabase.auth.signOut()
      if (err) setError(errorMessage(err))
      else { setSession(null); setNotice('Kamu sudah keluar dari akun.') }
    },
    addWork: (form, existing) => run(async () => {
      const id = await saveWork(form, me, session.user.id, existing)
      window.location.hash = `#/karya/${id}`
    }, existing ? 'Perubahan karya tersimpan.' : 'Karya berhasil diterbitkan.'),
    deleteWork: (id) => run(async () => {
      const rows = await mutate('works', 'delete', undefined, { id, username: me })
      if (!rows.length) throw new Error('Karya tidak ditemukan atau bukan milikmu.')
      window.location.hash = `#/kreator/${me}`
    }, 'Karya dihapus dari galeri.'),
    addComment: (workId, parentId, text) => run(() => mutate('comments', 'insert', { work_id: workId, parent_id: parentId, username: me, text }), 'Kritik berhasil dikirim.'),
    deleteComment: (id) => run(() => mutate('comments', 'update', { text: '[Komentar dihapus oleh penulis]' }, { id, username: me }), 'Komentar dihapus; balasan tetap tersedia.'),
    toggleLike: (workId) => run(() => state.works.find((w) => w.id === workId).likes.includes(me)
      ? mutate('likes', 'delete', undefined, { work_id: workId, username: me })
      : mutate('likes', 'insert', { work_id: workId, username: me }), 'Apresiasi diperbarui.'),
    updateProfile: (form) => run(async () => {
      const avatar = form.avatarFile ? await uploadImage(form.avatarFile, session.user.id) : currentUser.avatar
      await mutate('profiles', 'update', { display_name: form.displayName.trim(), bio: form.bio.trim(), website: form.website.trim(), avatar_url: avatar || '' }, { id: session.user.id })
    }, 'Profil berhasil diperbarui.')
  }
  const editing = state.works.find((w) => w.id === route.id)
  return <div className="app">
    <a className="skip-link" href="#main-content">Lewati navigasi</a>
    <header className="topbar"><div className="topbar-inner">
      <a className="brand" href="#/">Kreatif<span className="brand-dot">.</span></a>
      <nav className="topnav" aria-label="Navigasi utama"><a href="#/">Jelajah</a><a href="#/unggah">Unggah Karya</a></nav>
      <div className="topbar-user">{currentUser ? <><a className="userchip" href={`#/kreator/${me}`}><Avatar username={me} displayName={currentUser.displayName} src={currentUser.avatar} size={28} /><span>@{me}</span></a><button className="linkbtn" onClick={actions.signOut}>Keluar</button></> : <button className="btn btn-sm" onClick={openSignIn}>Masuk</button>}</div>
    </div></header>
    <main id="main-content">
      {!online && <div className="preview-banner"><strong>Pratinjau komunitas</strong><span>Karya contoh · akun dan penyimpanan online belum terhubung</span></div>}
      {error && <div className="notice" role="alert"><p>{error}</p>{online && <button className="linkbtn" onClick={reload}>Muat ulang data</button>}</div>}
      {notice && <p className="success-notice" role="status">{notice}</p>}
      {loading ? <section className="section" role="status"><h2>Menyiapkan ruang kreatif…</h2><p className="muted">Memuat karya dan profil komunitas.</p></section> : <>
        {route.name === 'home' && <Explore state={state} userMap={userMap} commentCounts={commentCounts} />}
        {route.name === 'work' && <WorkDetail key={route.id} workId={route.id} state={state} userMap={userMap} me={me} actions={actions} />}
        {route.name === 'profile' && <Profile key={route.username} username={route.username} state={state} userMap={userMap} me={me} actions={actions} />}
        {route.name === 'upload' && <Upload key="new" me={me} actions={actions} />}
        {route.name === 'edit' && (editing && editing.username === me ? <Upload key={editing.id} me={me} actions={actions} work={editing} /> : <p className="empty">Karya tidak ditemukan atau kamu tidak punya akses untuk mengeditnya.</p>)}
      </>}
    </main>
    <footer className="footer"><p>Kreatif — ruang berbagi portofolio dan kritik terbuka untuk kreator Indonesia. Kritik yang membangun, bukan yang merendahkan.</p></footer>
    {authOpen && <AuthDialog close={() => setAuthOpen(false)} />}
  </div>
}
