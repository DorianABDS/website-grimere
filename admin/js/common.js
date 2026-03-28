const API = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.API_URL) || 'http://localhost:5000'

async function checkSession() {
  try {
    const res = await fetch(API + '/api/auth/me', { credentials: 'include' })
    const data = await res.json()
    if (!data.connecte) { window.location.href = 'login.html'; return null }
    const pn = document.getElementById('profile-name')
    const pe = document.getElementById('profile-email')
    const pa = document.getElementById('profile-avatar')
    if (pn) pn.textContent = data.user.displayName || ''
    if (pe) pe.textContent = data.user.email || ''
    if (pa && data.user.displayName) pa.textContent = data.user.displayName[0]
    return data.user
  } catch(e) { window.location.href = 'login.html'; return null }
}

async function logout() {
  if (!confirm('Se déconnecter ?')) return
  try { await fetch(API + '/api/auth/logout', { method: 'POST', credentials: 'include' }) } catch(e) {}
  window.location.href = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.SITE_URL) || '../index.html'
}

async function loadBadges() {
  try {
    const res = await fetch(API + '/api/stats', { credentials: 'include' })
    if (!res.ok) return
    const s = await res.json()
    const bMsg = document.getElementById('badge-messages')
    if (bMsg) { if (s.messages.nonLus > 0) { bMsg.textContent = s.messages.nonLus; bMsg.style.display = '' } else bMsg.style.display = 'none' }
    const bAvis = document.getElementById('badge-avis')
    if (bAvis) { if (s.avis.enAttente > 0) { bAvis.textContent = s.avis.enAttente; bAvis.style.display = '' } else bAvis.style.display = 'none' }
  } catch(e) {}
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open')
  document.getElementById('overlay').classList.toggle('show')
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open')
  document.getElementById('overlay').classList.remove('show')
}

function showToast(title, type = 'success', sub = '') {
  // Retirer tout toast existant
  document.querySelectorAll('.toast').forEach(el => el.remove())

  const icon = type === 'success' ? '✓' : '✕'
  const t = document.createElement('div')
  t.className = `toast ${type}`
  t.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      ${sub ? `<div class="toast-sub">${sub}</div>` : ''}
    </div>`
  document.body.appendChild(t)

  // Entrée animée
  requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('show') }) })

  // Sortie après délai
  const delay = type === 'error' ? 4000 : 3000
  setTimeout(() => {
    t.style.animation = 'fadeOut .3s ease forwards'
    setTimeout(() => t.remove(), 300)
  }, delay)
}

function escHtml(str) {
  if (str == null) return ''
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
