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
let couverturesData = {}
let activeTheme = 'mariage'
let dragSrcIndex = null

async function loadGalerie() {
  // Charger les couvertures en parallèle avec les photos
  const [resGalerie, resCouv] = await Promise.allSettled([
    fetch(API + '/api/galerie', { credentials: 'include' }),
    fetch(API + '/api/galerie/couvertures', { credentials: 'include' })
  ])

  if (resGalerie.status === 'fulfilled' && resGalerie.value.ok) {
    allPhotos = await resGalerie.value.json()
  } else {
    allPhotos = {}
    showToast('Impossible de charger la galerie', 'error')
  }

  if (resCouv.status === 'fulfilled' && resCouv.value.ok) {
    couverturesData = await resCouv.value.json()
  } else {
    couverturesData = {}
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

  // Section couverture (au-dessus de la grille)
  const couv = couverturesData[activeTheme]
  const couvertureUrl = couv && couv.url ? couv.url : ''
  const themeLabel = THEMES.find(t => t.key === activeTheme)?.label || activeTheme
  const coverSection = document.createElement('div')
  coverSection.style.cssText = 'grid-column:1/-1;margin-bottom:1.5rem'
  const coverDiv = document.createElement('div')
  coverDiv.className = 'cover-section'
  coverDiv.style.cssText = 'display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--ardoise);border-radius:8px'
  const coverImg = document.createElement('img')
  coverImg.id = 'cover-preview'
  coverImg.src = couvertureUrl
  coverImg.alt = 'Couverture ' + themeLabel
  coverImg.style.cssText = 'width:120px;height:80px;object-fit:cover;border-radius:6px;border:2px solid var(--or)'
  const coverInfo = document.createElement('div')
  const coverLabel = document.createElement('input')
  coverLabel.type = 'file'
  coverLabel.accept = 'image/*'
  coverLabel.style.display = 'none'
  coverLabel.onchange = function() { changerCouverture(activeTheme, this) }
  const coverBtn = document.createElement('label')
  coverBtn.className = 'btn-outline'
  coverBtn.style.cssText = 'cursor:pointer;font-size:.8rem;padding:.4rem .9rem'
  coverBtn.textContent = 'Changer la couverture'
  coverBtn.appendChild(coverLabel)
  coverInfo.innerHTML = '<div style="font-size:.85rem;color:var(--or);margin-bottom:.5rem">Photo de couverture</div><div style="font-size:.75rem;color:rgba(245,240,232,.5);margin-bottom:.75rem">Visible sur le site public comme miniature du thème</div>'
  coverInfo.appendChild(coverBtn)
  coverDiv.appendChild(coverImg)
  coverDiv.appendChild(coverInfo)
  coverSection.innerHTML = ''
  coverSection.appendChild(coverDiv)
  grid.appendChild(coverSection)

  if (photos.length === 0) {
    const empty = document.createElement('div')
    empty.className = 'empty-state'
    empty.style.cssText = 'grid-column:1/-1'
    empty.innerHTML = '<div class="empty-icon">◻</div>Aucune photo dans ce thème'
    grid.appendChild(empty)
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

async function changerCouverture(theme, input) {
  if (!input.files[0]) return
  const fd = new FormData()
  fd.append('photo', input.files[0])
  fd.append('alt', theme)
  try {
    const res = await fetch(API + '/api/galerie/couverture/' + theme, {
      method: 'PUT', credentials: 'include', body: fd
    })
    if (!res.ok) throw new Error()
    const data = await res.json()
    couverturesData[theme] = { url: data.url, alt: data.alt || theme }
    const prev = document.getElementById('cover-preview')
    if (prev) prev.src = data.url
    if (typeof showToast === 'function') showToast('Couverture mise à jour ✓')
  } catch(e) {
    if (typeof showToast === 'function') showToast('Erreur upload couverture', 'error')
  }
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
