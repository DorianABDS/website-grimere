const API = (window.ADMIN_CONFIG && window.ADMIN_CONFIG.API_URL) || 'https://api.cedric-grimere-photographie.fr'
let photoFile = null

async function init() {
  try {
    const res = await fetch(API + '/api/config/biographie', { credentials: 'include' })
    const d = await res.json()
    const set = (id, val) => { if(val) { const el = document.getElementById(id); if(el) el.value = val } }
    set('bio-titre', d.bio_titre)
    set('bio-sous-titre', d.bio_sous_titre)
    set('bio-description', d.bio_description)
    set('bio-citation', d.bio_citation)
    set('bio-ind1-val', d.bio_ind1_val)
    set('bio-ind1-label', d.bio_ind1_label)
    set('bio-ind2-val', d.bio_ind2_val)
    set('bio-ind2-label', d.bio_ind2_label)
    set('bio-ind3-val', d.bio_ind3_val)
    set('bio-ind3-label', d.bio_ind3_label)
    if(d.bio_photo) {
      const prev = document.getElementById('bio-photo-preview')
      if(prev) prev.src = d.bio_photo
    }
  } catch(e){}
}

async function sauvegarder() {
  const btn = document.getElementById('btn-save')
  btn.disabled = true
  btn.textContent = 'Sauvegarde...'
  try {
    const fd = new FormData()
    const fields = ['bio-titre','bio-sous-titre','bio-description','bio-citation','bio-ind1-val','bio-ind1-label','bio-ind2-val','bio-ind2-label','bio-ind3-val','bio-ind3-label']
    fields.forEach(id => {
      const el = document.getElementById(id)
      if(el) fd.append(id.replace(/-/g,'_'), el.value)
    })
    if(photoFile) fd.append('photo', photoFile)
    const res = await fetch(API + '/api/config/biographie', { method: 'PUT', credentials: 'include', body: fd })
    if(!res.ok) throw new Error()
    showToast('Biographie mise à jour ✓')
    photoFile = null
    const input = document.getElementById('bio-photo-input')
    if(input) input.value = ''
  } catch(e) {
    showToast('Erreur sauvegarde', 'error')
  } finally {
    btn.disabled = false
    btn.textContent = 'Sauvegarder tout'
  }
}

function previewPhoto(input) {
  if(!input.files[0]) return
  photoFile = input.files[0]
  const prev = document.getElementById('bio-photo-preview')
  if(prev) prev.src = URL.createObjectURL(photoFile)
}

checkSession().then(() => { loadBadges(); init() })
