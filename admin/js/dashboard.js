async function loadStats() {
  try {
    const res = await fetch(API + '/api/stats', { credentials: 'include' })
    if (!res.ok) throw new Error()
    const s = await res.json()

    document.getElementById('stat-nonlus').textContent     = s.messages.nonLus
    document.getElementById('stat-ceMois').textContent     = s.messages.ceMois + ' ce mois-ci'
    document.getElementById('stat-total-msg').textContent  = s.messages.total
    document.getElementById('stat-archives').textContent   = s.messages.archives + ' archivé' + (s.messages.archives > 1 ? 's' : '')
    document.getElementById('stat-en-attente').textContent = s.avis.enAttente
    document.getElementById('stat-note').textContent       = s.avis.noteMoyenne ? s.avis.noteMoyenne + ' ★' : '—'
    document.getElementById('stat-total-avis').textContent = s.avis.total + ' avis publié' + (s.avis.total > 1 ? 's' : '')

    const themes = s.galerie.photosParTheme || []
    document.getElementById('stat-total-photos').textContent = s.galerie.totalPhotos
    document.getElementById('stat-nb-themes').textContent    = themes.length + ' catégorie' + (themes.length > 1 ? 's' : '')

    const grid = document.getElementById('galerie-grid')
    const firstCard = document.getElementById('card-total-photos')
    grid.innerHTML = ''
    grid.appendChild(firstCard)
    themes.forEach(t => {
      const card = document.createElement('div')
      card.className = 'stat-card'
      const label = t.theme.charAt(0).toUpperCase() + t.theme.slice(1).replace('babyshower','Baby Shower').replace('evenement','Événement').replace('bapteme','Baptême')
      card.innerHTML = `<div class="stat-val">${t.count}</div><div class="stat-lbl">${label}</div>`
      grid.appendChild(card)
    })

    if (s.galerie.dernierePhoto) {
      const d = s.galerie.dernierePhoto
      document.getElementById('last-photo-img').src = d.url
      document.getElementById('last-photo-tag').textContent = d.theme
      const date = new Date(d.createdAt)
      document.getElementById('last-photo-date').textContent = 'Dernière photo · ' + date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      document.getElementById('last-photo-box').style.display = 'flex'
    }

    document.getElementById('stat-presta-actives').textContent  = s.prestations.actives
    document.getElementById('stat-presta-inactives').textContent = s.prestations.inactives + ' inactif' + (s.prestations.inactives > 1 ? 's' : '')
    document.getElementById('stat-presta-top').textContent      = s.prestations.plusDemandee || '—'
    document.getElementById('stat-presta-nb').textContent       = s.prestations.nbDemandes + ' demande' + (s.prestations.nbDemandes > 1 ? 's' : '')

    const bMsg = document.getElementById('badge-messages')
    if (bMsg) { bMsg.textContent = s.messages.nonLus; bMsg.style.display = s.messages.nonLus > 0 ? '' : 'none' }
    const bAvis = document.getElementById('badge-avis')
    if (bAvis) { bAvis.textContent = s.avis.enAttente; bAvis.style.display = s.avis.enAttente > 0 ? '' : 'none' }

    document.getElementById('page-sub').textContent = 'Vue d\'ensemble · mis à jour à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch(e) {
    document.getElementById('page-sub').textContent = 'Erreur de chargement'
    showToast('Impossible de charger les statistiques', 'error')
  }
}

async function chargerHeroAdmin() {
  try {
    const res = await fetch(API + '/api/config/hero', { credentials: 'include' })
    if(!res.ok) return
    const data = await res.json()
    const prev = document.getElementById('hero-preview')
    if(prev && data.url) prev.src = data.url
  } catch(e){}
}

async function changerHero(input) {
  if(!input.files[0]) return
  const fd = new FormData()
  fd.append('photo', input.files[0])
  try {
    const res = await fetch(API + '/api/config/hero', {
      method: 'PUT', credentials: 'include', body: fd
    })
    if(!res.ok) throw new Error()
    const data = await res.json()
    const prev = document.getElementById('hero-preview')
    if(prev) prev.src = data.url
    showToast('Background hero mis à jour ✓')
  } catch(e) {
    showToast('Erreur upload hero', 'error')
  }
}

checkSession().then(u => { if (u) { loadStats(); chargerHeroAdmin() } })
