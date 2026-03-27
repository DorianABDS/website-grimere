const API = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.API_URL) || 'https://api.cedric-grimere-photographie.fr'

async function init() {
  // Charger le contenu hero
  try {
    const res = await fetch(API + '/api/config/hero-content', { credentials: 'include' })
    const d = await res.json()
    if(d.hero_titre) document.getElementById('hero-titre').value = d.hero_titre
    if(d.hero_sous_titre) document.getElementById('hero-sous-titre').value = d.hero_sous_titre
    if(d.hero_description) document.getElementById('hero-description').value = d.hero_description
  } catch(e){}

  // Charger le background
  try {
    const res = await fetch(API + '/api/config/hero', { credentials: 'include' })
    const d = await res.json()
    const prev = document.getElementById('hero-bg-preview')
    if(prev && d.url) prev.src = d.url
  } catch(e){}
}

async function sauvegarderContenu() {
  const btn = document.getElementById('btn-save-content')
  btn.disabled = true
  btn.textContent = 'Sauvegarde...'
  try {
    const body = {
      hero_titre: document.getElementById('hero-titre').value,
      hero_sous_titre: document.getElementById('hero-sous-titre').value,
      hero_description: document.getElementById('hero-description').value,
    }
    const res = await fetch(API + '/api/config/hero-content', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if(!res.ok) throw new Error()
    showToast('Contenu hero mis à jour ✓')
  } catch(e) {
    showToast('Erreur sauvegarde', 'error')
  } finally {
    btn.disabled = false
    btn.textContent = 'Sauvegarder le contenu'
  }
}

async function changerBackground(input) {
  if(!input.files[0]) return
  const fd = new FormData()
  fd.append('photo', input.files[0])
  try {
    const res = await fetch(API + '/api/config/hero', { method: 'PUT', credentials: 'include', body: fd })
    if(!res.ok) throw new Error()
    const d = await res.json()
    const prev = document.getElementById('hero-bg-preview')
    if(prev) prev.src = d.url
    showToast('Background mis à jour ✓')
  } catch(e) {
    showToast('Erreur upload', 'error')
  }
}

checkSession().then(() => { loadBadges(); init() })
