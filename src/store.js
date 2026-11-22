export const seedUsers = [
  {
    username: 'bimaskara',
    displayName: 'Bima Askara',
    bio: 'Melukis abstrak di antara jam kerja. Warna diambil dari ingatan tentang laut Surabaya.',
    joined: '2026-05-30T09:00:00Z'
  },
  {
    username: 'dimasprakoso',
    displayName: 'Dimas Prakoso',
    bio: 'Memotret kota dengan film 35mm. Tertarik pada cahaya sore dan arsitektur lama Yogyakarta.',
    joined: '2026-07-11T09:00:00Z'
  },
  {
    username: 'keenanadhi',
    displayName: 'Keenan Adhi',
    bio: 'Desainer grafis. Fokus pada tipografi dan identitas visual acara seni.',
    joined: '2026-06-20T09:00:00Z'
  },
  {
    username: 'mayaputra',
    displayName: 'Maya Putra',
    bio: 'Pembuat seramik di Bali. Tanah liat bakar kayu, bentuk yang jujur dan tidak diburu-rush.',
    joined: '2026-09-05T09:00:00Z'
  },
  {
    username: 'raraswulandari',
    displayName: 'Rara Wulandari',
    bio: 'Ilustrator watercolor dari Bandung. Menggambar hujan, taman, dan hal-hal yang perlahan.',
    joined: '2026-08-02T09:00:00Z'
  },
  {
    username: 'tiaramahesa',
    displayName: 'Tiara Mahesa',
    bio: 'Memahat figur dari tanah liat dan waktu luang. Semarang, kamar belakang rumah orang tua.',
    joined: '2026-10-01T09:00:00Z'
  }
]

export const seedWorks = [
  {
    id: 'w1',
    username: 'bimaskara',
    title: 'Sunyi di Ruang Ketiga',
    description:
      'Seri tiga kanvas tentang ruang antara dua tarikan napas. Akrilik di atas kanvas 90x120 cm. Warna biru tua sengaja dibiarkan "tenggelam" di bawah lapisan putih — saya ingin kesan sesuatu yang ada tapi tidak menonjol. Masukan soal komposisi bagian tengah sangat ditunggu.',
    image: '/stock/art-painting.jpg',
    tags: ['lukis abstrak', 'akrilik'],
    likes: ['dimasprakoso', 'raraswulandari', 'mayaputra'],
    createdAt: '2026-11-18T10:00:00Z'
  },
  {
    id: 'w2',
    username: 'dimasprakoso',
    title: 'Susur Kota Lama, Pukul Lima Sore',
    description:
      'Enam bingkai dari satu sore berkeliling kota lama dengan kamera film 35mm, lensa 50mm fixed. Tidak diedit selain scan. Saya masih ragu dengan bingkai keempat — terlalu ramah atau justru pas?',
    image: '/stock/art-filmphoto.jpg',
    tags: ['fotografi analog', 'film 35mm'],
    likes: ['raraswulandari', 'keenanadhi'],
    createdAt: '2026-11-15T14:30:00Z'
  },
  {
    id: 'w3',
    username: 'mayaputra',
    title: 'Gunung Tanah Liat',
    description:
      'Set wadah makan bakar kayu suhu 1.250°C. Glasir dibiarkan menetes mengikuti gravitasi, jadi tidak ada dua buah yang sama. Kritik soal bentuk tutup yang miring silakan langsung — itu memang bagian yang saya paling ragukan.',
    image: '/stock/art-ceramics.jpg',
    tags: ['keramik', 'bakar kayu'],
    likes: ['tiaramahesa', 'bimaskara', 'dimasprakoso', 'raraswulandari'],
    createdAt: '2026-11-10T08:00:00Z'
  },
  {
    id: 'w4',
    username: 'keenanadhi',
    title: 'Identitas Visual Biennale "Suar"',
    description:
      'Sistem poster untuk biennale seni rupa lokal. Satu grid, tiga bobot huruf, satu warna asam di atas kertas daur ulang. Tujuannya terbaca dari seberang jalan. Versi alternatif nomor 2 atau 3 yang lebih kuat?',
    image: '/stock/art-poster.jpg',
    tags: ['desain grafis', 'poster', 'tipografi'],
    likes: ['mayaputra'],
    createdAt: '2026-11-05T11:00:00Z'
  },
  {
    id: 'w5',
    username: 'raraswulandari',
    title: 'Taman Hujan — Ilustrasi Berseri',
    description:
      'Ilustrasi berseri untuk buku cerita anak tentang taman yang hanya hidup saat hujan. Watercolor di atas kertas 300 gsm, dua lapis. Saya mencari masukan soal ekspresi tokoh katak di halaman tiga.',
    image: '/stock/art-illustration.jpg',
    tags: ['ilustrasi', 'watercolor'],
    likes: ['bimaskara', 'mayaputra'],
    createdAt: '2026-10-28T09:30:00Z'
  },
  {
    id: 'w6',
    username: 'tiaramahesa',
    title: 'Dua Figur, Satu Angin',
    description:
      'Dua figur tanah liat setinggi 40 cm, belum dibakar. Sengaja dibiarkan jejak jari terlihat. Pertanyaan saya untuk kalian: apakah keduanya perlu pangkalan terpisah atau justru satu pangkalan bersama?',
    image: '/stock/art-sculpture.jpg',
    tags: ['patung', 'tanah liat'],
    likes: ['dimasprakoso'],
    createdAt: '2026-10-20T16:00:00Z'
  }
]

export const seedComments = [
  {
    id: 'c1',
    workId: 'w1',
    parentId: null,
    username: 'mayaputra',
    text: 'Lapisan putihnya berhasil — birunya terasa seperti di dalam air, bukan di kanvas. Kalau boleh saran: bagian tengah mungkin cukup satu area "tenggelam" saja, supaya mata punya satu tempat untuk beristirahat.',
    createdAt: '2026-11-18T13:10:00Z'
  },
  {
    id: 'c2',
    workId: 'w1',
    parentId: 'c1',
    username: 'bimaskara',
    text: 'Terima kasih, ini masuk akal. Saya memang ragu dua area itu bersaing. Mau saya coba tutup sebagian area kanan.',
    createdAt: '2026-11-18T15:40:00Z'
  },
  {
    id: 'c3',
    workId: 'w1',
    parentId: 'c2',
    username: 'mayaputra',
    text: 'Kalau ditutup, biarkan pinggirnya tidak rapi — kontras dengan bagian bawah yang kontinu.',
    createdAt: '2026-11-19T07:20:00Z'
  },
  {
    id: 'c4',
    workId: 'w1',
    parentId: null,
    username: 'keenanadhi',
    text: 'Sebagai orang desain: tiga kanvas ini akan kuat sekali kalau jarak antarbidang konsisten. Dokumentasinya saja sudah bisa jadi materi pameran.',
    createdAt: '2026-11-19T10:05:00Z'
  },
  {
    id: 'c5',
    workId: 'w2',
    parentId: null,
    username: 'raraswulandari',
    text: 'Bingkai keempat justru favorit saya — keramahannya kontras dengan gedung yang kaku. Yang perlu dipikirkan: urutannya. Sekarang ritmenya turun-naik, mungkin dibuat pelan-pelan naik ke bingkai terakhir?',
    createdAt: '2026-11-15T18:00:00Z'
  },
  {
    id: 'c6',
    workId: 'w2',
    parentId: 'c5',
    username: 'dimasprakoso',
    text: 'Ide ritme menaik ini bagus. Saya akan coba tukar bingkai dua dan lima, lalu unggah ulang seriannya.',
    createdAt: '2026-11-16T06:45:00Z'
  },
  {
    id: 'c7',
    workId: 'w5',
    parentId: null,
    username: 'tiaramahesa',
    text: 'Ekspresi kataknya menurut saya sudah tepat: bukan takut, cuma hati-hati. Anak-anak membaca itu. Satu catatan kecil: air di kolam halaman tiga ikut "berhenti" — mungkin butuh satu sapuan goyang.',
    createdAt: '2026-10-29T09:15:00Z'
  }
]

export function workCategory(work) {
  if (work.category) return work.category
  const tags = work.tags.join(' ')
  if (tags.includes('ilustrasi')) return 'Ilustrasi'
  if (tags.includes('fotografi')) return 'Fotografi'
  if (tags.includes('desain')) return 'Desain'
  if (/lukis|keramik|patung/.test(tags)) return 'Seni'
  return 'Lainnya'
}

export function normalizeUsername(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
}

export function isValidUsername(u) {
  return /^[a-z0-9_]{3,20}$/.test(u)
}

export function slugAvatarColors() {
  return ['#E2574C', '#2F6F6A', '#B4691E', '#5B5EA6', '#7A4E8C', '#3E6E8E']
}

export function avatarColor(username) {
  const colors = slugAvatarColors()
  let h = 0
  for (const ch of String(username)) h = (h * 31 + ch.charCodeAt(0)) % 997
  return colors[h % colors.length]
}

export function initials(name) {
  const parts = String(name)
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function timeAgo(iso) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'baru saja'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} hari lalu`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w} minggu lalu`
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
