// API est défini dans common.js — ne pas redéclarer ici

async function init() {
  try {
    const res = await fetch(API + '/api/config/hero-content', { credentials: 'include' })
    if (!res.ok) return
    const d = await res.json()
    if (d.hero_titre)      document.getElementById('hero-titre').value      = d.hero_titre
    if (d.hero_sous_titre) document.getElementById('hero-sous-titre').value = d.hero_sous_titre
    if (d.hero_description)document.getElementById('hero-description').value = d.hero_description
  } catch(e) {}

  try {
    const res = await fetch(API + '/api/config/hero', { credentials: 'include' })
    if (!res.ok) return
    const d = await res.json()
    if (d.url) {
      const prev = document.getElementById('hero-bg-preview')
      const ph   = document.getElementById('hero-bg-placeholder')
      if (prev) {
        prev.onload = () => { prev.style.opacity = '1'; if (ph) ph.style.display = 'none' }
        prev.src = d.url
      }
    }
  } catch(e) {}
}

async function sauvegarderContenu() {
  const btn = document.getElementById('btn-save-content')
  if (!btn) return
  btn.disabled    = true
  btn.textContent = 'Sauvegarde…'
  try {
    const body = {
      hero_titre:       document.getElementById('hero-titre').value,
      hero_sous_titre:  document.getElementById('hero-sous-titre').value,
      hero_description: document.getElementById('hero-description').value
    }
    const res = await fetch(API + '/api/config/hero-content', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error('Erreur ' + res.status)
    showToast('Contenu mis à jour', 'success', 'Les modifications sont en ligne sur le site')
  } catch(e) {
    showToast('Échec de la sauvegarde', 'error', e.message || 'Vérifiez votre connexion')
  } finally {
    btn.disabled    = false
    btn.textContent = 'Sauvegarder le contenu'
  }
}

async function changerBackground(input) {
  if (!input.files[0]) return
  const fd = new FormData()
  fd.append('photo', input.files[0])
  try {
    const res = await fetch(API + '/api/config/hero', {
      method: 'PUT',
      credentials: 'include',
      body: fd
    })
    if (!res.ok) throw new Error('Erreur ' + res.status)
    const d    = await res.json()
    const prev = document.getElementById('hero-bg-preview')
    const ph   = document.getElementById('hero-bg-placeholder')
    if (prev && d.url) {
      prev.onload = () => { prev.style.opacity = '1'; if (ph) ph.style.display = 'none' }
      prev.src = d.url
    }
    showToast('Background mis à jour', 'success', 'La nouvelle image est en ligne')
  } catch(e) {
    showToast('Échec de l\'upload', 'error', e.message || 'L\'image n\'a pas pu être envoyée')
  }
}

checkSession().then(() => { loadBadges(); init() })
