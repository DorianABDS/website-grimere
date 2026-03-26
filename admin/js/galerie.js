const THEMES = [
  { key: 'mariage',    label: 'Mariage' },
  { key: 'naissance',  label: 'Naissance' },
  { key: 'portrait',   label: 'Portrait' },
  { key: 'animalier',  label: 'Animalier' },
  { key: 'culinaire',  label: 'Culinaire' },
  { key: 'evenement',  label: 'Événement' },
  { key: 'bapteme',    label: 'Baptême' },
  { key: 'babyshower', label: 'Baby Shower' },
]

let allPhotos = {}
let activeTheme = 'mariage'
let dragSrcIndex = null

async function loadGalerie() {
  try {
    const res = await fetch(API + '/api/galerie', { credentials: 'include' })
    if (!res.ok) throw new Error()
    allPhotos = await res.json()
  } catch(e) {
    allPhotos = {}
    showToast('Impossible de charger la galerie', 'error')
  }
  renderTabs()
  renderGrid()
  updatePageSub()
}

function totalPhotos() {
  return THEMES.reduce((acc, t) => acc + ((allPhotos[t.key] || []).length), 0)
}

function updatePageSub() {
  const sub = document.getElementById('page-sub')
  const label = THEMES.find(t => t.key === activeTheme)?.label || activeTheme
  sub.textContent = `${totalPhotos()} photos · ${label}`
}

function renderTabs() {
  const container = document.getElementById('theme-tabs')
  container.innerHTML = ''
  THEMES.forEach(t => {
    const count = (allPhotos[t.key] || []).length
    const btn = document.createElement('button')
    btn.className = 'theme-tab' + (t.key === activeTheme ? ' active' : '')
    btn.innerHTML = `${t.label} <span class="theme-tab-count">${count}</span>`
    btn.onclick = () => { activeTheme = t.key; renderTabs(); renderGrid(); updatePageSub() }
    container.appendChild(btn)
  })
}

function renderGrid() {
  const grid = document.getElementById('photo-grid')
  const photos = allPhotos[activeTheme] || []
  grid.innerHTML = ''

  if (photos.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">◻</div>Aucune photo dans ce thème</div>`
    return
  }

  photos.forEach((photo, index) => {
    const card = document.createElement('div')
    card.className = 'photo-admin-card'
    card.draggable = true
    card.dataset.id = photo.id
    card.dataset.index = index

    const img = document.createElement('img')
    img.src = photo.url
    img.alt = photo.alt || ''
    img.loading = 'lazy'

    const overlay = document.createElement('div')
    overlay.className = 'photo-admin-overlay'

    const btnTheme = document.createElement('button')
    btnTheme.className = 'ph-btn'
    btnTheme.title = 'Changer de thème'
    btnTheme.textContent = '⇄'
    btnTheme.onclick = (e) => { e.stopPropagation(); toggleThemeSelect(card, photo) }

    const btnDel = document.createElement('button')
    btnDel.className = 'ph-btn danger'
    btnDel.title = 'Supprimer'
    btnDel.textContent = '✕'
    btnDel.onclick = (e) => { e.stopPropagation(); deletePhoto(photo.id, card) }

    overlay.appendChild(btnTheme)
    overlay.appendChild(btnDel)
    card.appendChild(img)
    card.appendChild(overlay)

    card.addEventListener('dragstart', (e) => {
      dragSrcIndex = index
      card.classList.add('dragging')
      e.dataTransfer.effectAllowed = 'move'
    })
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging')
      grid.querySelectorAll('.photo-admin-card').forEach(c => c.classList.remove('drag-over'))
    })
    card.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      grid.querySelectorAll('.photo-admin-card').forEach(c => c.classList.remove('drag-over'))
      card.classList.add('drag-over')
    })
    card.addEventListener('drop', (e) => {
      e.preventDefault()
      card.classList.remove('drag-over')
      const destIndex = parseInt(card.dataset.index)
      if (dragSrcIndex === null || dragSrcIndex === destIndex) return
      const arr = allPhotos[activeTheme]
      const [moved] = arr.splice(dragSrcIndex, 1)
      arr.splice(destIndex, 0, moved)
      dragSrcIndex = null
      renderGrid()
      saveReorder()
    })

    grid.appendChild(card)
  })
}

function toggleThemeSelect(card, photo) {
  const existing = card.querySelector('.theme-select')
  if (existing) { existing.remove(); return }

  const select = document.createElement('select')
  select.className = 'theme-select'

  THEMES.forEach(t => {
    if (t.key === photo.theme) return
    const opt = document.createElement('option')
    opt.value = t.key
    opt.textContent = t.label
    select.appendChild(opt)
  })

  select.addEventListener('change', async () => {
    const newTheme = select.value
    select.remove()
    await changePhotoTheme(photo.id, newTheme, photo)
  })
  select.addEventListener('click', e => e.stopPropagation())

  const overlay = card.querySelector('.photo-admin-overlay')
  overlay.appendChild(select)
}

async function changePhotoTheme(id, newTheme, photo) {
  try {
    const res = await fetch(`${API}/api/galerie/${id}/theme`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme })
    })
    if (!res.ok) throw new Error()
    const srcArr = allPhotos[activeTheme] || []
    const idx = srcArr.findIndex(p => p.id === id)
    if (idx !== -1) {
      const [moved] = srcArr.splice(idx, 1)
      moved.theme = newTheme
      if (!allPhotos[newTheme]) allPhotos[newTheme] = []
      allPhotos[newTheme].push(moved)
    }
    renderTabs(); renderGrid(); updatePageSub()
    showToast('Thème modifié')
  } catch(e) { showToast('Erreur lors du changement de thème', 'error') }
}

async function deletePhoto(id, card) {
  if (!confirm('Supprimer cette photo définitivement ?')) return
  try {
    const res = await fetch(`${API}/api/galerie/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error()
    const arr = allPhotos[activeTheme] || []
    const idx = arr.findIndex(p => p.id === id)
    if (idx !== -1) arr.splice(idx, 1)
    card.remove()
    renderTabs(); updatePageSub()
    if ((allPhotos[activeTheme] || []).length === 0) renderGrid()
    showToast('Photo supprimée')
  } catch(e) { showToast('Erreur lors de la suppression', 'error') }
}

async function saveReorder() {
  const photos = allPhotos[activeTheme] || []
  const ordre = photos.map((p, i) => ({ id: p.id, ordre: i }))
  try {
    await fetch(`${API}/api/galerie/reorder`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordre })
    })
  } catch(e) { showToast('Erreur lors de la sauvegarde de l\'ordre', 'error') }
}

async function uploadFiles(files) {
  if (!files || files.length === 0) return
  const formData = new FormData()
  formData.append('theme', activeTheme)
  Array.from(files).forEach(f => formData.append('photos', f))
  showToast(`Envoi de ${files.length} photo${files.length > 1 ? 's' : ''}…`, 'success')
  try {
    const res = await fetch(`${API}/api/galerie/upload`, { method: 'POST', credentials: 'include', body: formData })
    if (!res.ok) throw new Error()
    showToast(`${files.length} photo${files.length > 1 ? 's' : ''} ajoutée${files.length > 1 ? 's' : ''}`)
    await loadGalerie()
  } catch(e) { showToast('Erreur lors de l\'upload', 'error') }
}

const uploadZone = document.getElementById('upload-zone')
const fileInput = document.getElementById('file-input')

uploadZone.addEventListener('click', () => fileInput.click())
uploadZone.addEventListener('dragenter', (e) => { e.preventDefault(); uploadZone.classList.add('drag-active') })
uploadZone.addEventListener('dragover',  (e) => { e.preventDefault(); uploadZone.classList.add('drag-active') })
uploadZone.addEventListener('dragleave', (e) => { if (!uploadZone.contains(e.relatedTarget)) uploadZone.classList.remove('drag-active') })
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadZone.classList.remove('drag-active')
  uploadFiles(e.dataTransfer.files)
})
fileInput.addEventListener('change', () => { uploadFiles(fileInput.files); fileInput.value = '' })

checkSession().then(user => { if (!user) return; loadBadges(); loadGalerie() })
