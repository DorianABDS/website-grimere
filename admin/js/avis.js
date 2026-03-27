let avis = []
let filtreActif = 'tous'

async function init() {
  await loadAvis()
}

async function loadAvis() {
  try {
    const res = await fetch(API + '/api/avis/tous', { credentials: 'include' })
    if (!res.ok) throw new Error('Erreur serveur')
    avis = await res.json()
    updateStats()
    renderGrid()
  } catch(e) {
    document.getElementById('avis-grid').innerHTML = '<div class="loading" style="grid-column:1/-1">Impossible de charger les avis.</div>'
  }
}

function updateStats() {
  const approuves = avis.filter(a => a.statut === 'APPROUVE')
  const enAttente = avis.filter(a => a.statut === 'EN_ATTENTE')
  const noteMoy = approuves.length
    ? (approuves.reduce((s, a) => s + (a.note || 0), 0) / approuves.length).toFixed(1)
    : '—'
  document.getElementById('stat-note').textContent = approuves.length ? `${noteMoy} ★` : '—'
  document.getElementById('stat-total').textContent = avis.length
  document.getElementById('stat-attente').textContent = enAttente.length
  const approuvesCount = approuves.length
  const attenteCount = enAttente.length
  const refusesCount = avis.filter(a => a.statut === 'REFUSE').length
  document.getElementById('page-sub').textContent =
    `${avis.length} avis — ${approuvesCount} approuvé${approuvesCount > 1 ? 's' : ''}, ${attenteCount} en attente, ${refusesCount} refusé${refusesCount > 1 ? 's' : ''}`
}

function setFiltre(filtre) {
  filtreActif = filtre
  document.querySelectorAll('[data-filtre]').forEach(btn => {
    btn.classList.toggle('active-filter', btn.dataset.filtre === filtre)
  })
  renderGrid()
}

function getFiltered() {
  if (filtreActif === 'tous') return avis
  return avis.filter(a => a.statut === filtreActif)
}

function renderGrid() {
  const filtered = getFiltered()
  const grid = document.getElementById('avis-grid')
  if (!filtered.length) {
    grid.innerHTML = '<div class="loading" style="grid-column:1/-1">Aucun avis dans cette catégorie.</div>'
    return
  }
  grid.innerHTML = filtered.map(a => renderCard(a)).join('')
}

function renderCard(a) {
  const stars = renderStars(a.note)
  const pillClass = a.statut === 'EN_ATTENTE' ? 'attente' : a.statut === 'APPROUVE' ? 'approuve' : 'refuse'
  const pillLabel = a.statut === 'EN_ATTENTE' ? 'En attente' : a.statut === 'APPROUVE' ? 'Approuvé' : 'Refusé'
  const date = formatDate(a.createdAt)
  const actionsBtns = a.statut === 'EN_ATTENTE'
    ? `<button class="btn-approve" onclick="approuver('${a.id}')">✓ Approuver</button>
       <button class="btn-refuse" onclick="refuser('${a.id}')">✕ Refuser</button>`
    : ''
  return `
    <div class="avis-card" id="avis-card-${a.id}">
      <div class="avis-card-header">
        <div class="avis-nom">${escHtml(a.nom)}</div>
        <div class="avis-stars">${stars}</div>
      </div>
      ${a.prestation ? `<div class="avis-presta">${escHtml(a.prestation)}</div>` : ''}
      <div class="avis-texte">${escHtml(a.commentaire)}</div>
      <div class="avis-footer">
        <div class="avis-actions">
          ${actionsBtns}
          <button class="btn-delete-sm" onclick="supprimerAvis('${a.id}')">Supprimer</button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.3rem">
          <span class="tag-pill ${pillClass}">${pillLabel}</span>
          <span class="avis-date">${date}</span>
        </div>
      </div>
    </div>
  `
}

function renderStars(note) {
  const n = Math.round(note || 0)
  return '★'.repeat(Math.min(n, 5)) + '☆'.repeat(Math.max(0, 5 - n))
}

function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) }
  catch(e) { return '' }
}

async function approuver(id) { await changerStatut(id, 'APPROUVE') }
async function refuser(id) { await changerStatut(id, 'REFUSE') }

async function changerStatut(id, statut) {
  try {
    const res = await fetch(`${API}/api/avis/${id}/statut`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut })
    })
    if (!res.ok) throw new Error()
    const updated = await res.json()
    const idx = avis.findIndex(a => String(a.id) === String(id))
    if (idx !== -1) avis[idx] = updated
    const data = idx !== -1 ? avis[idx] : { ...updated }
    updateStats()
    const cardEl = document.getElementById(`avis-card-${id}`)
    if (filtreActif !== 'tous' && filtreActif !== statut) {
      if (cardEl) cardEl.remove()
      const grid = document.getElementById('avis-grid')
      if (!grid.querySelector('.avis-card')) {
        grid.innerHTML = '<div class="loading" style="grid-column:1/-1">Aucun avis dans cette catégorie.</div>'
      }
    } else {
      if (cardEl) {
        cardEl.insertAdjacentHTML('afterend', renderCard(data))
        cardEl.remove()
      }
    }
    showToast(`Avis ${statut === 'APPROUVE' ? 'approuvé' : 'refusé'}`)
  } catch(e) { showToast('Erreur lors de la mise à jour', 'error') }
}

async function supprimerAvis(id) {
  if (!confirm('Supprimer définitivement cet avis ?')) return
  try {
    const res = await fetch(`${API}/api/avis/${id}`, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error()
    avis = avis.filter(a => String(a.id) !== String(id))
    const cardEl = document.getElementById(`avis-card-${id}`)
    if (cardEl) cardEl.remove()
    const grid = document.getElementById('avis-grid')
    if (!grid.querySelector('.avis-card')) {
      grid.innerHTML = '<div class="loading" style="grid-column:1/-1">Aucun avis dans cette catégorie.</div>'
    }
    updateStats()
    showToast('Avis supprimé')
  } catch(e) { showToast('Erreur lors de la suppression', 'error') }
}

checkSession().then(() => { loadBadges(); init() })
