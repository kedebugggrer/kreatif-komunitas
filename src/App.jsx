import React, { useEffect, useMemo, useState } from 'react'
import { Avatar } from './components.jsx'
import { Explore, Profile, Upload, WorkDetail } from './views.jsx'
import {
  isValidUsername,
  loadSession,
  loadState,
  normalizeUsername,
  saveSession,
  saveState,
  uid
} from './store.js'

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  const segments = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (segments.length === 0) return { name: 'home' }
  if (segments[0] === 'karya' && segments[1]) return { name: 'work', id: segments[1] }
  if (segments[0] === 'kreator' && segments[1]) return { name: 'profile', username: segments[1].toLowerCase() }
  if (segments[0] === 'unggah') return { name: 'upload' }
  return { name: 'home' }
}

export default function App() {
  const [state, setState] = useState(loadState)
  const [me, setMe] = useState(loadSession)
  const [authOpen, setAuthOpen] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authError, setAuthError] = useState('')
  const route = useHashRoute()

  useEffect(() => saveState(state), [state])

  const userMap = useMemo(() => {
    const map = {}
    for (const u of state.users) map[u.username] = u
    return map
  }, [state.users])

  const commentCounts = useMemo(() => {
    const counts = {}
    for (const c of state.comments) counts[c.workId] = (counts[c.workId] || 0) + 1
    return counts
  }, [state.comments])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  const openSignIn = (e) => {
    if (e) e.preventDefault()
    setAuthOpen(true)
    setAuthError('')
  }

  const actions = {
    openSignIn,
    signIn: () => {
      const username = normalizeUsername(authName)
      if (!isValidUsername(username)) {
        setAuthError('Gunakan 3–20 huruf, angka, atau garis bawah (tanpa spasi).')
        return
      }
      setState((s) =>
        s.users.some((u) => u.username === username)
          ? s
          : {
              ...s,
              users: [
                ...s.users,
                {
                  username,
                  displayName: username.charAt(0).toUpperCase() + username.slice(1),
                  bio: '',
                  joined: new Date().toISOString()
                }
              ]
            }
      )
      setMe(username)
      saveSession(username)
      setAuthOpen(false)
      setAuthName('')
    },
    signOut: () => {
      setMe(null)
      saveSession(null)
    },
    addWork: ({ title, description, tags, image }) => {
      const id = uid('w')
      const work = {
        id,
        username: me,
        title: title.trim(),
        description: description.trim(),
        tags,
        image,
        likes: [],
        createdAt: new Date().toISOString()
      }
      setState((s) => ({ ...s, works: [work, ...s.works] }))
      window.location.hash = `#/karya/${id}`
    },
    addComment: (workId, parentId, text) => {
      const comment = {
        id: uid('c'),
        workId,
        parentId,
        username: me,
        text,
        createdAt: new Date().toISOString()
      }
      setState((s) => ({ ...s, comments: [...s.comments, comment] }))
    },
    deleteComment: (id) => {
      setState((s) => {
        const doomed = new Set([id])
        let grew = true
        while (grew) {
          grew = false
          for (const c of s.comments) {
            if (c.parentId && doomed.has(c.parentId) && !doomed.has(c.id)) {
              doomed.add(c.id)
              grew = true
            }
          }
        }
        return { ...s, comments: s.comments.filter((c) => !doomed.has(c.id)) }
      })
    },
    toggleLike: (workId) => {
      if (!me) {
        openSignIn()
        return
      }
      setState((s) => ({
        ...s,
        works: s.works.map((w) =>
          w.id === workId
            ? {
                ...w,
                likes: w.likes.includes(me) ? w.likes.filter((u) => u !== me) : [...w.likes, me]
              }
            : w
        )
      }))
    },
    updateProfile: ({ displayName, bio }) => {
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.username === me ? { ...u, displayName, bio } : u))
      }))
    }
  }

  const submitAuth = (e) => {
    e.preventDefault()
    actions.signIn()
  }

  const currentUser = me ? userMap[me] : null

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#/">
            Kreatif<span className="brand-dot">.</span>
          </a>
          <nav className="topnav" aria-label="Navigasi utama">
            <a href="#/">Jelajah</a>
            <a href="#/unggah">Unggah Karya</a>
          </nav>
          <div className="topbar-user">
            {currentUser ? (
              <>
                <a className="userchip" href={`#/kreator/${me}`}>
                  <Avatar username={me} displayName={currentUser.displayName} size={28} />
                  <span>@{me}</span>
                </a>
                <button className="linkbtn" onClick={actions.signOut}>
                  Keluar
                </button>
              </>
            ) : (
              <button className="btn btn-sm" onClick={openSignIn}>
                Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        {route.name === 'home' && <Explore state={state} userMap={userMap} commentCounts={commentCounts} />}
        {route.name === 'work' && (
          <WorkDetail workId={route.id} state={state} userMap={userMap} me={me} actions={actions} />
        )}
        {route.name === 'profile' && (
          <Profile username={route.username} state={state} userMap={userMap} me={me} actions={actions} />
        )}
        {route.name === 'upload' && <Upload me={me} userMap={userMap} actions={actions} />}
      </main>

      <footer className="footer">
        <p>
          Kreatif — ruang berbagi portofolio dan kritik terbuka untuk kreator Indonesia. Kritik yang
          membangun, bukan yang merendahkan.
        </p>
      </footer>

      {authOpen && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setAuthOpen(false)}>
          <form className="dialog" onSubmit={submitAuth} role="dialog" aria-modal="true" aria-label="Masuk atau daftar">
            <h2>Masuk atau Daftar</h2>
            <p className="muted">
              Pilih username unik. Kalau sudah pernah dipakai, kamu akan langsung masuk ke profil itu.
            </p>
            <label>
              Username
              <input
                value={authName}
                onChange={(e) => {
                  setAuthName(e.target.value)
                  setAuthError('')
                }}
                placeholder="mis. raraswulandari"
                autoFocus
                required
              />
            </label>
            {authError && <p className="form-error" role="alert">{authError}</p>}
            <div className="comment-form-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAuthOpen(false)}>
                Batal
              </button>
              <button type="submit" className="btn btn-sm">
                Lanjutkan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
