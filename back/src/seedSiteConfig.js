const prisma = require('./config/prisma')

// Contenu par défaut extrait directement du front/index.html
const DEFAULTS = [
  { cle: 'hero_sous_titre',  valeur: 'Photographe & Artiste Visuelle' },
  { cle: 'hero_titre',       valeur: "Chaque instant\nmérite\nd'être éternel." },
  { cle: 'hero_description', valeur: "Je capture l'émotion brute, la lumière fugace, les fragments de vie qui font une histoire. Basée à Port-de-Bouc, disponible partout." },
  { cle: 'bio_sous_titre',   valeur: 'Mon histoire' },
  { cle: 'bio_titre',        valeur: "Une vision, une lumière,\nvotre histoire." },
  { cle: 'bio_description',  valeur: "Photographe depuis maintenant 1 an, j'ai développé un regard singulier entre l'intime et le grandiose. Mon travail s'articule autour d'une conviction simple : la meilleure photo est celle qui vous fait ressentir quelque chose avant même de la comprendre. Étant autodidacte, j'ai appris par moi-même et aussi grâce aux conseils de professionnels de la photo. Chaque séance est pour moi une rencontre — et chaque image, une promesse de beauté." },
  { cle: 'bio_citation',     valeur: "« La photographie est l'art de figer le temps pour le rendre éternel. »" },
  { cle: 'bio_ind1_val',     valeur: '1' },
  { cle: 'bio_ind1_label',   valeur: "An d'expérience" },
  { cle: 'bio_ind2_val',     valeur: '8' },
  { cle: 'bio_ind2_label',   valeur: 'Formules disponibles' },
  { cle: 'bio_ind3_val',     valeur: '♥' },
  { cle: 'bio_ind3_label',   valeur: 'Passion & créativité' },
]

async function seedSiteConfig() {
  try {
    for (const { cle, valeur } of DEFAULTS) {
      const existing = await prisma.siteConfig.findUnique({ where: { cle } })
      if (!existing) {
        await prisma.siteConfig.create({ data: { cle, valeur } })
        console.log(`  ✓ SiteConfig seedé : ${cle}`)
      }
    }
    console.log('  ✓ SiteConfig vérifié')
  } catch(e) {
    console.error('Erreur seed SiteConfig :', e.message)
  }
}

module.exports = seedSiteConfig
