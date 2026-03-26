let messages = []
let currentView = 'actifs'
let selectedId = null

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff/60000)} min`
  if (diff < 86400000) return `Il y a ${Math.floor(diff/3600000)} h`
  if (diff < 604800000) return `Il y a ${Math.floor(diff/86400000)} j`
  return d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })
}

function updatePageSub() {
  const nonLus = messages.filter(m => !m.lu).length
  const sub = document.getElementById('page-sub')
  if (currentView === 'actifs') {
    sub.textContent = nonLus > 0
      ? `${nonLus} message${nonLus > 1 ? 's' : ''} non lu${nonLus > 1 ? 's' : ''}`
      : 'Tous les messages lus'
  } else {
    sub.textContent = `${messages.length} message${messages.length !== 1 ? 's' : ''} archivé${messages.length !== 1 ? 's' : ''}`
  }
}

function renderList() {
  const container = document.getElementById('msg-list')
  if (messages.length === 0) {
    container.innerHTML = `<div class="msg-empty">${currentView === 'actifs' ? 'Aucun message actif' : 'Aucun message archivé'}</div>`
    return
  }
  container.innerHTML = messages.map(m => `
    <div class="msg-row${m.id === selectedId ? ' active' : ''}" id="row-${m.id}" onclick="selectMessage('${m.id}')">
      <div class="msg-row-nom${!m.lu ? ' unread' : ''}">
        ${!m.lu ? '<span class="unread-dot" id="dot-'+m.id+'"></span>' : '<span id="dot-'+m.id+'" style="display:none" class="unread-dot"></span>'}
        ${escHtml(m.nom)}
      </div>
      <div class="msg-row-presta">${escHtml(m.prestation || '')}</div>
      <div class="msg-row-apercu">${escHtml(m.message || '')}</div>
      <div class="msg-row-footer">
        <span class="msg-row-date">${formatDate(m.createdAt)}</span>
      </div>
    </div>
  `).join('')
}

function renderDetail(msg) {
  if (!msg) {
    document.getElementById('msg-detail').innerHTML = '<div class="msg-detail-empty">Sélectionnez un message pour le lire</div>'
    return
  }
  const subject = encodeURIComponent('Re: ' + (msg.prestation || 'Votre demande'))
  const isArchived = currentView === 'archives'
  document.getElementById('msg-detail').innerHTML = `
    <div>
      <div class="msg-detail-nom">${escHtml(msg.nom)}</div>
      <a class="msg-detail-email" href="mailto:${escHtml(msg.email)}">${escHtml(msg.email)}</a>
      <div class="msg-detail-tag">${escHtml(msg.prestation || 'Sans prestation')}</div>
    </div>
    <div class="msg-detail-text">${escHtml(msg.message || '')}</div>
    <div class="msg-detail-actions">
      <a class="btn-reply" href="mailto:${escHtml(msg.email)}?subject=${subject}">✉ Répondre</a>
      ${!isArchived ? `<button class="btn-archive" onclick="archiveMsg('${msg.id}')">Archiver</button>` : ''}
      <button class="btn-delete-sm" onclick="deleteMsg('${msg.id}')">Supprimer</button>
      <button class="btn-toggle-lu" id="btn-lu-${msg.id}" onclick="toggleLu('${msg.id}')">
        ${msg.lu ? 'Marquer non lu' : 'Marquer lu'}
      </button>
    </div>
  `
}

async function selectMessage(id) {
  const msg = messages.find(m => m.id == id)
  if (!msg) return
  if (selectedId) {
    const oldRow = document.getElementById('row-' + selectedId)
    if (oldRow) oldRow.classList.remove('active')
  }
  selectedId = id
  const row = document.getElementById('row-' + id)
  if (row) row.classList.add('active')
  renderDetail(msg)
  if (!msg.lu) {
    try {
      await fetch(API + '/api/messages/' + id + '/lu', { method: 'PATCH', credentials: 'include' })
      msg.lu = true
      const dot = document.getElementById('dot-' + id)
      if (dot) dot.style.display = 'none'
      const nomEl = row ? row.querySelector('.msg-row-nom') : null
      if (nomEl) nomEl.classList.remove('unread')
      const btnLu = document.getElementById('btn-lu-' + id)
      if (btnLu) btnLu.textContent = 'Marquer non lu'
      updatePageSub()
      loadBadges()
    } catch(e) {}
  }
}

async function toggleLu(id) {
  const msg = messages.find(m => m.id == id)
  if (!msg) return
  try {
    await fetch(API + '/api/messages/' + id + '/lu', { method: 'PATCH', credentials: 'include' })
    msg.lu = !msg.lu
    const dot = document.getElementById('dot-' + id)
    const row = document.getElementById('row-' + id)
    const nomEl = row ? row.querySelector('.msg-row-nom') : null
    if (msg.lu) {
      if (dot) dot.style.display = 'none'
      if (nomEl) nomEl.classList.remove('unread')
    } else {
      if (dot) dot.style.display = ''
      if (nomEl) nomEl.classList.add('unread')
    }
    const btnLu = document.getElementById('btn-lu-' + id)
    if (btnLu) btnLu.textContent = msg.lu ? 'Marquer non lu' : 'Marquer lu'
    updatePageSub()
    loadBadges()
    showToast(msg.lu ? 'Marqué comme lu' : 'Marqué comme non lu')
  } catch(e) { showToast('Erreur lors de la mise à jour', 'error') }
}

async function archiveMsg(id) {
  try {
    const res = await fetch(API + '/api/messages/' + id + '/archive', { method: 'PATCH', credentials: 'include' })
    if (!res.ok) throw new Error()
    messages = messages.filter(m => m.id != id)
    selectedId = null
    renderList(); renderDetail(null); updatePageSub(); loadBadges()
    showToast('Message archivé')
  } catch(e) { showToast('Erreur lors de l\'archivage', 'error') }
}

async function deleteMsg(id) {
  if (!confirm('Supprimer définitivement ce message ?')) return
  try {
    const res = await fetch(API + '/api/messages/' + id, { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error()
    messages = messages.filter(m => m.id != id)
    selectedId = null
    renderList(); renderDetail(null); updatePageSub(); loadBadges()
    showToast('Message supprimé')
  } catch(e) { showToast('Erreur lors de la suppression', 'error') }
}

async function loadMessages(view) {
  const url = view === 'archives' ? API + '/api/messages/archives' : API + '/api/messages'
  try {
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error()
    messages = await res.json()
    selectedId = null
    renderList(); renderDetail(null); updatePageSub()
  } catch(e) {
    document.getElementById('msg-list').innerHTML = '<div class="msg-empty">Erreur de chargement</div>'
    document.getElementById('page-sub').textContent = 'Erreur de connexion'
  }
}

function switchView(view) {
  currentView = view
  document.getElementById('btn-actifs').classList.toggle('active', view === 'actifs')
  document.getElementById('btn-archives').classList.toggle('active', view === 'archives')
  loadMessages(view)
}

;(async () => {
  const user = await checkSession()
  if (!user) return
  await loadBadges()
  await loadMessages('actifs')
})()
