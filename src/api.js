import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const online = Boolean(url && key)
export const supabase = online ? createClient(url, key, { auth: { detectSessionInUrl: false } }) : null
export const categories = ['Ilustrasi', 'Fotografi', 'Desain', 'Seni', 'Lainnya']

function checked({ data, error }) {
  if (error) throw error
  return data
}

export async function fetchCommunity() {
  const [users, works, comments, likes] = await Promise.all(
    ['profiles', 'works', 'comments', 'likes'].map(async (table) => {
      const rows = []
      for (let start = 0; ; start += 500) {
        const query = supabase.from(table).select('*')
        if (table === 'likes') query.order('work_id').order('username')
        else query.order('id')
        const page = checked(await query.range(start, start + 499))
        rows.push(...page)
        if (page.length < 500) return rows
      }
    })
  )
  return {
    users: users.map((u) => ({ ...u, displayName: u.display_name, avatar: u.avatar_url })),
    works: works.map((w) => ({ ...w, image: w.images[0], createdAt: w.created_at, likes: likes.filter((l) => l.work_id === w.id).map((l) => l.username) })),
    comments: comments.map((c) => ({ ...c, workId: c.work_id, parentId: c.parent_id, createdAt: c.created_at }))
  }
}

export function validateImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Pilih gambar JPG, PNG, atau WebP.')
  if (file.size > 3_000_000) throw new Error('Ukuran setiap gambar maksimal 3 MB.')
}

export async function uploadImage(file, userId) {
  validateImage(file)
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type]
  const path = `${userId}/${crypto.randomUUID()}.${ext}`
  checked(await supabase.storage.from('portfolio').upload(path, file))
  return supabase.storage.from('portfolio').getPublicUrl(path).data.publicUrl
}

export async function removeImages(images) {
  const prefix = `${url}/storage/v1/object/public/portfolio/`
  const paths = images.filter((image) => image.startsWith(prefix)).map((image) => image.slice(prefix.length))
  if (paths.length) checked(await supabase.storage.from('portfolio').remove(paths))
}

export async function saveWork(form, username, userId, existing) {
  const uploaded = []
  let result
  try {
    for (const file of form.files) uploaded.push(await uploadImage(file, userId))
    const values = { title: form.title.trim(), description: form.description.trim(), tags: form.tags, category: form.category, images: [...form.images, ...uploaded] }
    result = checked(await (existing
      ? supabase.from('works').update(values).eq('id', existing.id)
      : supabase.from('works').insert({ ...values, username })).select().single())
  } catch (error) {
    try { await removeImages(uploaded) } catch { /* The original save error takes precedence. */ }
    throw error
  }
  return result.id
}

export async function mutate(table, operation, values, filters = {}) {
  let query = supabase.from(table)[operation](values)
  for (const [column, value] of Object.entries(filters)) query = query.eq(column, value)
  return checked(await query.select())
}

export function errorMessage(error) {
  if (error?.code === '23505') return 'Username sudah dipakai. Pilih username lain.'
  if (error?.message?.includes('Invalid login credentials')) return 'Email atau kata sandi salah.'
  if (error?.message?.includes('Email not confirmed')) return 'Konfirmasi email dulu sebelum masuk.'
  if (error?.message?.includes('Database error saving new user')) return 'Akun belum dibuat. Username mungkin sudah dipakai; coba username lain.'
  if (error?.message?.includes('Failed to fetch')) return 'Koneksi terputus. Periksa internet lalu coba lagi.'
  return error?.message || 'Permintaan gagal. Silakan coba lagi.'
}
