// ── Navigation ───────────────────────────────────────────────────────────
let menuOpen=false;
function goTo(s){document.querySelector(s)?.scrollIntoView({behavior:'smooth'})}
function toggleMenu(){
  menuOpen=!menuOpen;
  document.getElementById('mobile-menu').style.display=menuOpen?'block':'none';
  const h1=document.getElementById('h1'),h2=document.getElementById('h2'),h3=document.getElementById('h3');
  if(menuOpen){h1.style.transform='rotate(45deg) translateY(6px)';h2.style.opacity='0';h3.style.transform='rotate(-45deg) translateY(-6px)'}
  else{h1.style.transform='';h2.style.opacity='1';h3.style.transform=''}
}
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>60);
});

// ── Scroll reveal ────────────────────────────────────────────────────────
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}});
},{threshold:0.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

// ── Galerie : uniquement les photos de la base de données ────────────────
const THEME_LABELS = {
  mariage:    'Mariage',
  naissance:  'Naissance & Grossesse',
  portrait:   'Portrait',
  animalier:  'Animalier',
  culinaire:  'Culinaire',
  evenement:  'Événement & Entreprise',
  bapteme:    'Baptême & Célébration',
  babyshower: 'Baby Shower & Anniversaire',
}
let themes = {}

// ── CONFIG API ───────────────────────────────────────────────────────────
const API_URL = (window.SITE_CONFIG && window.SITE_CONFIG.API_URL) || 'http://localhost:5000'

// ── Modal Avis ────────────────────────────────────────────────────────────
let noteSelectionnee = 0
function openModalAvis() {
  document.getElementById('modalAvisBg').classList.add('open')
  document.body.style.overflow = 'hidden'
}
function closeModalAvis() {
  document.getElementById('modalAvisBg').classList.remove('open')
  document.body.style.overflow = ''
  document.getElementById('avis-nom').value = ''
  document.getElementById('avis-prestation').value = ''
  document.getElementById('avis-commentaire').value = ''
  noteSelectionnee = 0
  document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('lit'))
  document.getElementById('modalAvisForm').style.display = ''
  document.getElementById('modalAvisConfirm').style.display = 'none'
}
function setNote(n) {
  noteSelectionnee = n
  document.querySelectorAll('.star-btn').forEach(s => s.classList.toggle('lit', parseInt(s.dataset.val) <= n))
}
async function submitAvis(btn) {
  const nom = document.getElementById('avis-nom').value.trim()
  const prestation = document.getElementById('avis-prestation').value
  const commentaire = document.getElementById('avis-commentaire').value.trim()
  if (!nom || !prestation || !noteSelectionnee || !commentaire) {
    alert('Veuillez remplir tous les champs et sélectionner une note.')
    return
  }
  btn.textContent = 'Envoi...'
  btn.disabled = true
  try {
    const res = await fetch(API_URL + '/api/avis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nom, prestation, note: noteSelectionnee, commentaire })
    })
    if (!res.ok) throw new Error()
    document.getElementById('modalAvisForm').style.display = 'none'
    document.getElementById('modalAvisConfirm').style.display = 'block'
  } catch(e) {
    alert('Erreur lors de l\'envoi. Veuillez réessayer.')
    btn.textContent = 'Envoyer →'
    btn.disabled = false
  }
}

// ── Chargement initial depuis l'API ──────────────────────────────────────
async function chargerHero(){
  try {
    const res = await fetch(API_URL+'/api/config/hero')
    if(!res.ok) return
    const data = await res.json()
    if(data.url){
      const img = document.getElementById('hero-bg')
      if(img) img.src = data.url
    }
  } catch(e){}
}

async function chargerHeroContent(){
  try {
    const res = await fetch(API_URL+'/api/config/hero-content')
    if(!res.ok) return
    const d = await res.json()
    if(d.hero_titre) { const el = document.getElementById('hero-titre'); if(el) el.textContent = d.hero_titre }
    if(d.hero_sous_titre) { const el = document.getElementById('hero-sous-titre'); if(el) el.textContent = d.hero_sous_titre }
    if(d.hero_description) { const el = document.getElementById('hero-description'); if(el) el.textContent = d.hero_description }
  } catch(e){}
}

async function chargerBiographie(){
  try {
    const res = await fetch(API_URL+'/api/config/biographie')
    if(!res.ok) return
    const d = await res.json()
    const set = (id, val) => { if(val) { const el = document.getElementById(id); if(el) el.textContent = val } }
    set('bio-titre', d.bio_titre)
    set('bio-sous-titre', d.bio_sous_titre)
    set('bio-description', d.bio_description)
    set('bio-ind1-val', d.bio_ind1_val)
    set('bio-ind1-label', d.bio_ind1_label)
    set('bio-ind2-val', d.bio_ind2_val)
    set('bio-ind2-label', d.bio_ind2_label)
    set('bio-ind3-val', d.bio_ind3_val)
    set('bio-ind3-label', d.bio_ind3_label)
    set('bio-citation', d.bio_citation)
    if(d.bio_photo) { const img = document.getElementById('bio-photo'); if(img) img.src = d.bio_photo }
  } catch(e){}
}

async function initSite(){
  await Promise.all([chargerGalerie(), chargerPrestations(), chargerAvis(), chargerHero(), chargerHeroContent(), chargerBiographie()])
}

async function initAvecRetry(){
  const MAX = 5
  for(let i = 0; i < MAX; i++){
    try {
      const res = await fetch(API_URL+'/api/prestations', { signal: AbortSignal.timeout(8000) })
      if(res.ok){ await initSite(); return }
    } catch(e){}
    if(i < MAX - 1) await new Promise(r => setTimeout(r, 3000))
  }
  await initSite()
}

async function chargerGalerie(){
  // 1. Couvertures → mettre à jour les images des cards
  try {
    const resCouv = await fetch(API_URL+'/api/galerie/couvertures')
    if(resCouv.ok){
      const couvertures = await resCouv.json()
      for(const [key, couv] of Object.entries(couvertures)){
        if(!couv || !couv.url) continue
        const card = document.getElementById('tc-'+key)
        if(card){ const img=card.querySelector('img'); if(img){ img.src=couv.url; img.alt=couv.alt||key } }
      }
    }
  } catch(e){}

  // 2. Photos DB → remplacer entièrement le contenu de themes
  try {
    const res = await fetch(API_URL+'/api/galerie')
    if(!res.ok) throw new Error()
    const data = await res.json()
    themes = {}
    for(const key of Object.keys(THEME_LABELS)){
      const photos = data[key] || []
      themes[key] = { label: THEME_LABELS[key], photos: photos.map(p=>({src:p.url,alt:p.alt||key})) }
      const card = document.getElementById('tc-'+key)
      if(card){ const s=card.querySelector('small'); if(s) s.textContent=photos.length+' photo'+(photos.length>1?'s':'') }
    }
  } catch(e){ console.log('Galerie : erreur chargement') }
}

async function chargerPrestations(){
  try {
    const res = await fetch(API_URL+'/api/prestations')
    if(!res.ok) throw new Error()
    const data = await res.json()
    const grid = document.getElementById('packs-grid')
    if(!grid||!data.length) return
    grid.innerHTML = data.map(p=>`
      <div class="pack ${p.populaire?'popular':''}" data-cat="${p.categorie}" ${p.populaire?'style="position:relative"':''}>
        ${p.badge?`<span class="badge">${p.badge}</span>`:''}
        <span class="tag" style="margin-bottom:0;font-size:.65rem">${p.titre}</span>
        <div class="pack-price">${p.prix}</div>
        <div style="color:var(--cendre);font-size:.78rem;margin-bottom:1.25rem">${p.sousTitre||''}</div>
        <ul class="pack-feat">${p.details.map(d=>`<li>${d}</li>`).join('')}</ul>
        <button class="${p.populaire?'btn-gold':'btn-or-outline'}" ${p.populaire?'style="width:100%"':''} onclick="goTo('#contact')">Réserver</button>
      </div>`).join('')
  } catch(e){ console.log('Prestations : données HTML statiques conservées') }
}

async function chargerAvis(){
  try {
    const res = await fetch(API_URL+'/api/avis')
    if(!res.ok) throw new Error()
    const data = await res.json()
    const grid = document.querySelector('.grid-av')
    if(!grid||!data.length) return
    grid.innerHTML = data.map(a=>`
      <div class="avis-card">
        <div class="fd" style="font-size:3rem;color:rgba(201,168,76,.2);line-height:1;margin-bottom:.5rem">"</div>
        <p class="fd" style="font-size:1rem;color:rgba(245,240,232,.7);font-style:italic;line-height:1.7;margin-bottom:1rem">${a.commentaire}</p>
        <div style="color:var(--or);font-size:.9rem;margin-bottom:1rem">${'★'.repeat(a.note)}${'☆'.repeat(5-a.note)}</div>
        <hr style="border:none;border-top:1px solid var(--ardoise);margin-bottom:1rem"/>
        <div style="display:flex;align-items:center;gap:.8rem">
          <div style="width:2.5rem;height:2.5rem;border-radius:50%;background:var(--ardoise);display:flex;align-items:center;justify-content:center;color:var(--or);font-family:'Cormorant Garamond',serif;font-size:1.1rem;flex-shrink:0">${a.nom.charAt(0).toUpperCase()}</div>
          <div><div style="font-size:.85rem;color:var(--ivoire)">${a.nom}</div><div style="font-size:.7rem;color:var(--cendre)">${a.prestation}</div></div>
        </div>
      </div>`).join('')
  } catch(e){ console.log('Avis : données HTML statiques conservées') }
}

// Lancer au démarrage avec retry si le backend est en cold start
initAvecRetry()

let curTheme=null,curIdx=0;
function openTheme(id){
  if(curTheme===id){closeTheme();return;}
  curTheme=id;
  document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('tc-'+id).classList.add('active');
  const t=themes[id];
  const label=THEME_LABELS[id]||id;
  document.getElementById('grid-title').textContent=label;
  const g=document.getElementById('photo-grid');
  g.innerHTML='';
  if(!t||t.photos.length===0){
    g.innerHTML='<p style="color:var(--cendre);font-style:italic;padding:2rem 0">Aucune photo dans cette catégorie pour le moment.</p>';
  } else {
    t.photos.forEach((p,i)=>{
      const b=document.createElement('button');
      b.onclick=()=>openLB(i);
      const img=document.createElement('img');
      img.src=p.src;img.alt=p.alt;img.loading='lazy';
      b.appendChild(img);g.appendChild(b);
    });
  }
  const s=document.getElementById('photo-section');
  s.style.display='block';
  setTimeout(()=>s.scrollIntoView({behavior:'smooth',block:'nearest'}),100);
}
function closeTheme(){
  curTheme=null;
  document.getElementById('photo-section').style.display='none';
  document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('active'));
}
function openLB(i){
  curIdx=i;updateLB();
  document.getElementById('lightbox').style.display='flex';
  document.body.style.overflow='hidden';
}
function closeLB(){
  document.getElementById('lightbox').style.display='none';
  document.body.style.overflow='';
}
function updateLB(){
  const p=themes[curTheme].photos,ph=p[curIdx];
  document.getElementById('lb-img').src=ph.src;
  document.getElementById('lb-img').alt=ph.alt;
  document.getElementById('lb-cap').textContent=ph.alt+' — '+(curIdx+1)+' / '+p.length;
}
function prevP(){curIdx=(curIdx-1+themes[curTheme].photos.length)%themes[curTheme].photos.length;updateLB();}
function nextP(){curIdx=(curIdx+1)%themes[curTheme].photos.length;updateLB();}
document.addEventListener('keydown',e=>{
  if(document.getElementById('lightbox').style.display==='flex'){
    if(e.key==='Escape')closeLB();
    if(e.key==='ArrowLeft')prevP();
    if(e.key==='ArrowRight')nextP();
  }
});

// ── Filtres prestations ──────────────────────────────────────────────────
function filterPacks(cat,btn){
  document.querySelectorAll('.pack-filter').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#packs-grid .pack').forEach(c=>{
    c.classList.toggle('hidden',cat!=='all'&&c.dataset.cat!==cat);
  });
}

// ── Formulaire contact branchée sur l'API ────────────────────────────────
async function submitForm(){
  const nom=document.getElementById('nom').value.trim();
  const email=document.getElementById('email').value.trim();
  const prestation=document.getElementById('prestation').value;
  const message=document.getElementById('message').value.trim();
  if(!nom||!email||!message){alert('Merci de remplir les champs obligatoires (*).'); return;}
  const btn=document.querySelector('#form-wrap .btn-gold');
  btn.textContent='Envoi en cours...'; btn.disabled=true;
  try {
    const res=await fetch(API_URL+'/api/contact',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nom,email,prestation,message})
    });
    if(!res.ok) throw new Error();
    document.getElementById('form-wrap').style.display='none';
    document.getElementById('form-confirm').style.display='flex';
  } catch(e){
    alert("Erreur lors de l'envoi. Contactez directement : " + (window.SITE_CONFIG && window.SITE_CONFIG.EMAIL || ''));
    btn.textContent='Envoyer le message →'; btn.disabled=false;
  }
}
function resetForm(){
  ['nom','email','message'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('prestation').value='';
  document.getElementById('form-confirm').style.display='none';
  document.getElementById('form-wrap').style.display='block';
}

// ── Initialisation depuis SITE_CONFIG (variables d'environnement frontend) ─
;(function(){
  const C = window.SITE_CONFIG || {}
  const IG_HANDLE = C.INSTAGRAM ? '@' + C.INSTAGRAM.replace(/.*instagram\.com\//,'') + ' ↗' : ''



  const vh = document.getElementById('cfg-ville-hero')
  if(vh) vh.textContent = C.VILLE || ''

  const vc = document.getElementById('cfg-ville-contact')
  if(vc) vc.textContent = C.VILLE || ''

  const em = document.getElementById('cfg-email')
  if(em && C.EMAIL){ em.href = 'mailto:' + C.EMAIL; em.textContent = C.EMAIL }

  const ig = document.getElementById('cfg-insta')
  if(ig && C.INSTAGRAM){ ig.href = C.INSTAGRAM; ig.textContent = IG_HANDLE }

  const logo = document.getElementById('cfg-footer-logo')
  if(logo && C.NOM){
    const initiales = C.NOM.trim().split(/\s+/).map(n=>n[0]).join('').toUpperCase().slice(0,2)
    logo.innerHTML = initiales + '<span style="color:var(--or)">.</span>'
  }

  const copy = document.getElementById('cfg-footer-copy')
  if(copy) copy.textContent = '© ' + new Date().getFullYear() + ' ' + (C.NOM||'') + ' · Tous droits réservés · ' + (C.VILLE||'')

  const fi = document.getElementById('cfg-footer-insta')
  if(fi && C.INSTAGRAM) fi.href = C.INSTAGRAM
})()
