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

// ── Galerie : données depuis l'API, fallback sur mock si pas encore déployé
let themes = {}

// Données de secours (mock) utilisées tant que l'API n'est pas branchée
const THEMES_MOCK={
  mariage:{label:'Mariage',photos:[
    {src:'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',alt:'Cérémonie de mariage en plein air'},
    {src:'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80',alt:'Échange des alliances'},
    {src:'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=1200&q=80',alt:'Portrait des mariés'},
    {src:'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80',alt:'Détail robe de mariée'},
    {src:'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80',alt:'Danse de mariage'},
    {src:'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',alt:'Bouquet de fleurs'},
  ]},
  naissance:{label:'Naissance & Grossesse',photos:[
    {src:'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=80',alt:'Séance naissance nouveau-né'},
    {src:'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=80',alt:'Portrait grossesse en lumière naturelle'},
    {src:'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=1200&q=80',alt:'Mains bébé nouveau-né'},
    {src:'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1200&q=80',alt:'Shooting grossesse en extérieur'},
    {src:'https://images.unsplash.com/photo-1518708909080-704599b19972?w=1200&q=80',alt:'Portrait famille nouveau-né'},
  ]},
  portrait:{label:'Portrait',photos:[
    {src:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&q=80',alt:'Portrait femme lumière naturelle'},
    {src:'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1200&q=80',alt:'Portrait homme en studio'},
    {src:'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80',alt:'Portrait artistique'},
    {src:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80',alt:'Portrait mode éditorial'},
    {src:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',alt:'Portrait professionnel'},
  ]},
  animalier:{label:'Animalier',photos:[
    {src:'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80',alt:'Portrait chien golden retriever'},
    {src:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80',alt:'Chiens en balade'},
    {src:'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1200&q=80',alt:'Portrait chat curieux'},
    {src:'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&q=80',alt:'Chat en extérieur'},
    {src:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',alt:'Chien portrait artistique'},
  ]},
  culinaire:{label:'Culinaire',photos:[
    {src:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',alt:'Plat gastronomique'},
    {src:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',alt:'Table dressée restaurant'},
    {src:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',alt:'Pizza artisanale'},
    {src:'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=80',alt:'Petit-déjeuner stylisé'},
    {src:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80',alt:'Légumes frais colorés'},
  ]},
  evenement:{label:'Événement & Entreprise',photos:[
    {src:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',alt:'Conférence entreprise'},
    {src:'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',alt:'Événement corporate'},
    {src:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',alt:'Compétition sportive'},
    {src:'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80',alt:'Athlète en action'},
    {src:'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',alt:'Scène événement festif'},
  ]},
  bapteme:{label:'Baptême & Célébration',photos:[
    {src:'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200&q=80',alt:'Cérémonie de baptême'},
    {src:'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80',alt:'Famille lors d une célébration'},
    {src:'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&q=80',alt:'Décoration de fête'},
    {src:'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',alt:'Cocktail familial'},
    {src:'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=1200&q=80',alt:'Portrait famille célébration'},
  ]},
  babyshower:{label:'Baby Shower & Anniversaire',photos:[
    {src:'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80',alt:'Décoration baby shower'},
    {src:'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',alt:'Gâteau anniversaire'},
    {src:'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=1200&q=80',alt:'Ballons décoration fête'},
    {src:'https://images.unsplash.com/photo-1558618047-f4e90f6ceb73?w=1200&q=80',alt:'Ambiance anniversaire'},
    {src:'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=80',alt:'Moments joyeux en famille'},
  ]}
}

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
async function initSite(){
  await Promise.all([chargerGalerie(), chargerPrestations(), chargerAvis()])
}

async function chargerGalerie(){
  try {
    const res = await fetch(API_URL+'/api/galerie')
    if(!res.ok) throw new Error()
    const data = await res.json()
    for(const [key, photos] of Object.entries(data)){
      if(THEMES_MOCK[key]) THEMES_MOCK[key].photos = photos.map(p=>({src:p.url,alt:p.alt||key}))
      const card = document.getElementById('tc-'+key)
      if(card){ const s=card.querySelector('small'); if(s) s.textContent=photos.length+' photo'+(photos.length>1?'s':'') }
    }
  } catch(e){ console.log('Galerie : données mock utilisées') }
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

// Lancer au démarrage
initSite()

let curTheme=null,curIdx=0;
themes=THEMES_MOCK;
function openTheme(id){
  if(curTheme===id){closeTheme();return;}
  curTheme=id;
  document.querySelectorAll('.theme-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('tc-'+id).classList.add('active');
  const t=themes[id];
  if(!t) return;
  document.getElementById('grid-title').textContent=t.label;
  const g=document.getElementById('photo-grid');
  g.innerHTML='';
  t.photos.forEach((p,i)=>{
    const b=document.createElement('button');
    b.onclick=()=>openLB(i);
    const img=document.createElement('img');
    img.src=p.src;img.alt=p.alt;img.loading='lazy';
    b.appendChild(img);g.appendChild(b);
  });
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

  if(C.NOM) document.title = C.NOM + ' — Photographe'

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
