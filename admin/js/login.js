if (new URLSearchParams(window.location.search).get('error') === 'acces_refuse') {
  document.getElementById('errorBox').classList.remove('hidden')
}

;(function() {
  const C = window.ADMIN_CONFIG || {}
  const n = document.getElementById('cfg-nom'); if (n) n.textContent = C.NOM || ''
  const v = document.getElementById('cfg-ville'); if (v) v.textContent = C.VILLE || ''
  if (C.NOM) document.title = 'Admin — Connexion · ' + C.NOM
})()

function handleLogin(e) {
  e.preventDefault()
  const btn = document.getElementById('loginBtn')
  btn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="animation:spin .8s linear infinite;flex-shrink:0">
      <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,.15)" stroke-width="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" stroke-width="3" stroke-linecap="round"/>
    </svg>
    Connexion en cours...
  `
  btn.style.pointerEvents = 'none'
  const API = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.API_URL) || 'http://localhost:5000'
  window.location.href = API + '/api/auth/google'
}
