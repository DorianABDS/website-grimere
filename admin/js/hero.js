const API = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.API_URL) || 'https://api.cedric-grimere-photographie.fr'

async function init() {
  try {
    const [heroContent, heroBg] = await Promise.all([
      fetch(API + '/api/config/hero-content', { credentials: 'include' }).then(r => r.json()),
      fetch(API + '/api/config/hero', { credentials: 'include' }).then(r => r.json())
    ])
    if(heroContent.hero_titre) document.getElementById('hero-titre').textContent = heroContent.hero_titre
    if(heroContent.hero_sous_titre) document.getElementById('hero-sous-titre').textContent = heroContent.hero_sous_titre
    if(heroContent.hero_description) document.getElementById('hero-description').textContent = heroContent.hero_description
    if(heroBg.url) document.getElementById('hero-bg').src = heroBg.url
  } catch(e){}
}

async function sauvegarder() {
  const btn = document.getElementById('btn-save')
  btn.textContent = 'Sauvegarde...'
  btn.disabled = true
  try {
    const body = {
      hero_titre: document.getElementById('hero-titre').textContent.trim(),
      hero_sous_titre: document.getElementById('hero-sous-titre').textContent.trim(),
      hero_description: document.getElementById('hero-description').textContent.trim(),
    }
    const res = await fetch(API + '/api/config/hero-content', {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if(!res.ok) throw new Error()
    showToast('Hero sauvegardé ✓')
  } catch(e) {
    showToast('Erreur sauvegarde', 'error')
  } finally {
    btn.textContent = 'Sauvegarder'
    btn.disabled = false
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
    document.getElementById('hero-bg').src = d.url
    showToast('Background mis à jour ✓')
  } catch(e) {
    showToast('Erreur upload', 'error')
  }
}

checkSession().then(() => { loadBadges(); init() })
