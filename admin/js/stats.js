let chartGalerie = null
let chartMessages = null
let chartAvis = null

const CHART_BAR_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: 'rgba(245,240,232,.4)', font: { size: 10, family: 'DM Sans' } }, grid: { color: 'rgba(44,44,44,.5)' } },
    y: { ticks: { color: 'rgba(245,240,232,.4)', font: { size: 10, family: 'DM Sans' } }, grid: { color: 'rgba(44,44,44,.5)' }, beginAtZero: true }
  }
}

const CHART_DOUGHNUT_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom', labels: { color: 'rgba(245,240,232,.5)', font: { size: 10, family: 'DM Sans' }, padding: 12 } }
  }
}

const THEME_LABELS = {
  mariage: 'Mariage', naissance: 'Naissance', portrait: 'Portrait',
  animalier: 'Animalier', culinaire: 'Culinaire', evenement: 'Événement',
  bapteme: 'Baptême', babyshower: 'Baby Shower'
}

async function loadStats() {
  try {
    const res = await fetch(API + '/api/stats', { credentials: 'include' })
    if (!res.ok) throw new Error()
    const s = await res.json()

    const themes = s.galerie.photosParTheme || []
    document.getElementById('stat-total-photos').textContent     = s.galerie.totalPhotos
    document.getElementById('stat-nb-themes').textContent        = themes.length
    document.getElementById('stat-nonlus').textContent           = s.messages.nonLus
    document.getElementById('stat-total-msg').textContent        = s.messages.total
    document.getElementById('stat-ceMois').textContent           = s.messages.ceMois + ' ce mois-ci'
    document.getElementById('stat-en-attente').textContent       = s.avis.enAttente
    document.getElementById('stat-note').textContent             = s.avis.noteMoyenne ? s.avis.noteMoyenne + ' ★' : '—'
    document.getElementById('stat-total-avis').textContent       = s.avis.total + ' publié' + (s.avis.total > 1 ? 's' : '')
    document.getElementById('stat-presta-total').textContent     = s.prestations.total
    document.getElementById('stat-presta-actives').textContent   = s.prestations.actives
    document.getElementById('stat-presta-inactives').textContent = s.prestations.inactives
    document.getElementById('stat-presta-top').textContent       = s.prestations.plusDemandee || '—'
    document.getElementById('stat-presta-nb').textContent        = s.prestations.nbDemandes + ' demande' + (s.prestations.nbDemandes > 1 ? 's' : '')

    const bMsg = document.getElementById('badge-messages')
    if (bMsg) { bMsg.textContent = s.messages.nonLus; bMsg.style.display = s.messages.nonLus > 0 ? '' : 'none' }
    const bAvis = document.getElementById('badge-avis')
    if (bAvis) { bAvis.textContent = s.avis.enAttente; bAvis.style.display = s.avis.enAttente > 0 ? '' : 'none' }

    if (chartGalerie) chartGalerie.destroy()
    chartGalerie = new Chart(document.getElementById('chart-galerie'), {
      type: 'bar',
      data: {
        labels: themes.map(t => THEME_LABELS[t.theme] || t.theme),
        datasets: [{ data: themes.map(t => t.count), backgroundColor: 'rgba(201,168,76,.55)', borderColor: '#c9a84c', borderWidth: 1, borderRadius: 3 }]
      },
      options: CHART_BAR_OPTS
    })

    if (chartMessages) chartMessages.destroy()
    chartMessages = new Chart(document.getElementById('chart-messages'), {
      type: 'doughnut',
      data: {
        labels: ['Non lus', 'Lus', 'Archivés'],
        datasets: [{ data: [s.messages.nonLus, s.messages.total - s.messages.nonLus, s.messages.archives], backgroundColor: ['rgba(239,68,68,.6)', 'rgba(201,168,76,.55)', 'rgba(107,114,128,.5)'], borderWidth: 0 }]
      },
      options: CHART_DOUGHNUT_OPTS
    })

    if (chartAvis) chartAvis.destroy()
    chartAvis = new Chart(document.getElementById('chart-avis'), {
      type: 'doughnut',
      data: {
        labels: ['Publiés', 'En attente'],
        datasets: [{ data: [s.avis.total, s.avis.enAttente], backgroundColor: ['rgba(74,222,128,.5)', 'rgba(251,191,36,.5)'], borderWidth: 0 }]
      },
      options: CHART_DOUGHNUT_OPTS
    })

    document.getElementById('page-sub').textContent = 'Données en temps réel · mis à jour à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch(e) {
    document.getElementById('page-sub').textContent = 'Erreur de chargement'
    showToast('Impossible de charger les statistiques', 'error')
  }
}

checkSession().then(u => { if (u) loadStats() })
