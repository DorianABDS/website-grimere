let prestations = []

async function init() {
  await loadPrestations()
}

async function loadPrestations() {
  try {
    const res = await fetch(API + '/api/prestations/tous', { credentials: 'include' })
    if (!res.ok) throw new Error('Erreur serveur')
    prestations = await res.json()
    renderList()
  } catch(e) {
    document.getElementById('presta-list').innerHTML = '<div class="loading">Impossible de charger les prestations.</div>'
  }
}

function renderList() {
  const actifs = prestations.filter(p => p.actif).length
  document.getElementById('page-sub').textContent = `${prestations.length} forfait${prestations.length > 1 ? 's' : ''} — ${actifs} actif${actifs > 1 ? 's' : ''}`
  if (!prestations.length) {
    document.getElementById('presta-list').innerHTML = '<div class="loading">Aucune prestation configurée.</div>'
    return
  }
  document.getElementById('presta-list').innerHTML = prestations.map(p => renderCard(p)).join('')
}

function renderCard(p) {
  const dotColor = p.actif ? '#4ade80' : '#6b6b6b'
  const cardClass = ['presta-card', !p.actif ? 'inactive' : '', p.populaire ? 'popular' : ''].filter(Boolean).join(' ')
  const details = Array.isArray(p.details) ? p.details : []
  const toggleLabel = p.actif ? 'Désactiver' : 'Activer'
  return `
    <div class="${cardClass}" id="card-${p.id}">
      <div class="presta-left">
        <div class="presta-header">
          <span class="presta-name">${escHtml(p.titre)}</span>
          ${p.badge ? `<span class="presta-badge">${escHtml(p.badge)}</span>` : ''}
          <span class="presta-status-dot" style="background:${dotColor}" title="${p.actif ? 'Actif' : 'Inactif'}"></span>
        </div>
        <div class="presta-prix">${escHtml(p.prix)}</div>
        ${p.sousTitre ? `<div class="presta-sous">${escHtml(p.sousTitre)}</div>` : ''}
        ${details.length ? `<ul class="presta-details">${details.map(d => `<li>${escHtml(d)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="presta-actions">
        <button class="btn-outline-sm" onclick="openModal('${p.id}')">Modifier</button>
        <button class="btn-outline-sm" onclick="toggleStatut('${p.id}')" id="btn-toggle-${p.id}">${toggleLabel}</button>
      </div>
    </div>
  `
}

function replaceCardInDOM(id, html) {
  const cardEl = document.getElementById(`card-${id}`)
  if (!cardEl) return
  cardEl.insertAdjacentHTML('afterend', html)
  cardEl.remove()
}

async function toggleStatut(id) {
  const btn = document.getElementById(`btn-toggle-${id}`)
  if (btn) btn.disabled = true
  try {
    const res = await fetch(`${API}/api/prestations/${id}/statut`, { method: 'PATCH', credentials: 'include' })
    if (!res.ok) throw new Error()
    await loadPrestations()
    showToast('Prestation mise à jour')
  } catch(e) {
    showToast('Erreur lors de la mise à jour', 'error')
    if (btn) btn.disabled = false
  }
}

function openModal(id) {
  const p = prestations.find(p => String(p.id) === String(id))
  if (!p) return
  document.getElementById('edit-id').value = p.id
  document.getElementById('edit-titre').value = p.titre || ''
  document.getElementById('edit-prix').value = p.prix || ''
  document.getElementById('edit-sous-titre').value = p.sousTitre || ''
  document.getElementById('edit-badge').value = p.badge || ''
  document.getElementById('edit-details').value = Array.isArray(p.details) ? p.details.join('\n') : ''
  document.getElementById('edit-populaire').checked = !!p.populaire
  document.getElementById('modal-edit').classList.add('open')
}

function closeModal() {
  document.getElementById('modal-edit').classList.remove('open')
}

async function savePrestation(e) {
  e.preventDefault()
  const id = document.getElementById('edit-id').value
  const rawDetails = document.getElementById('edit-details').value
  const details = rawDetails.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const body = {
    titre: document.getElementById('edit-titre').value.trim(),
    prix: document.getElementById('edit-prix').value.trim(),
    sousTitre: document.getElementById('edit-sous-titre').value.trim(),
    badge: document.getElementById('edit-badge').value.trim(),
    details,
    populaire: document.getElementById('edit-populaire').checked
  }
  try {
    const res = await fetch(`${API}/api/prestations/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error()
    await loadPrestations()
    closeModal()
    showToast('Prestation mise à jour')
  } catch(e) { showToast('Erreur lors de la sauvegarde', 'error') }
}

document.getElementById('modal-edit').addEventListener('click', function(e) {
  if (e.target === this) closeModal()
})

checkSession().then(() => { loadBadges(); init() })
