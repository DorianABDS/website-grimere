// ─── Seed : insère les 8 prestations en base ─────────────────────────────
// Lancer UNE SEULE FOIS après npm run db:push :  npm run db:seed

require('dotenv').config()
const prisma = require('./config/prisma')

const COUVERTURES_DEFAULT = [
  { theme: 'mariage',    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Cérémonie de mariage' },
  { theme: 'naissance',  url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80', alt: 'Séance naissance nouveau-né' },
  { theme: 'portrait',   url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', alt: 'Portrait lumière naturelle' },
  { theme: 'animalier',  url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', alt: 'Portrait chien golden retriever' },
  { theme: 'culinaire',  url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', alt: 'Plat gastronomique' },
  { theme: 'evenement',  url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', alt: 'Événement entreprise' },
  { theme: 'bapteme',    url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', alt: 'Cérémonie de baptême' },
  { theme: 'babyshower', url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', alt: 'Décoration baby shower' },
]

const PRESTATIONS = [
  {
    slug: 'naissance', categorie: 'famille', ordre: 1,
    titre: 'Naissance · Grossesse · Shooting',
    prix: '100€', sousTitre: '/ séance · 2h de présence',
    details: [
      '2h de présence sur place',
      'Prêt de différents accessoires au choix',
      '10 photos retouchées HD',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'animalier', categorie: 'special', ordre: 2,
    titre: 'Animalier · Chien · Chat',
    prix: '150€', sousTitre: '/ séance · 2h de présence',
    details: [
      '2h de présence sur place',
      '15 photos retouchées HD',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'culinaire', categorie: 'special', ordre: 3,
    titre: 'Culinaire',
    prix: '150€', sousTitre: '/ séance',
    details: [
      '10 photos retouchées HD',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'babyshower', categorie: 'evenement', ordre: 4,
    titre: 'Baby Shower · Anniversaire · EVG',
    prix: '250€', sousTitre: '/ événement · 3h de présence',
    details: [
      '3h de présence sur place',
      '80 photos retouchées HD',
      'Photos numériques HD supplémentaires',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'evenement', categorie: 'evenement', ordre: 5,
    titre: 'Événement · Sportif · Entreprise',
    prix: '200€', sousTitre: '/ événement · 3h de présence',
    details: [
      '3h de présence sur place',
      'Photo reportage — 200 photos numériques HD',
      '20 photos retouchées HD sélectionnées par vos soins',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'bapteme', categorie: 'evenement', ordre: 6,
    titre: 'Baptême',
    prix: '400€', sousTitre: '/ cérémonie · 4h de présence',
    details: [
      '4h de présence (cérémonie, famille, cocktail)',
      '100 photos retouchées HD',
      'Photos numériques HD supplémentaires',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'mariage', categorie: 'famille', ordre: 7,
    titre: 'Mariage',
    prix: '800€', sousTitre: "/ jour · cérémonie jusqu'au vin d'honneur",
    details: [
      "Du début de cérémonie jusqu'au vin d'honneur",
      '150 photos retouchées HD',
      'Photos numériques HD supplémentaires',
      'Quelques clichés noir & blanc artistiques',
      'Fichiers haute résolution',
    ],
  },
  {
    slug: 'mariage-complet', categorie: 'famille', ordre: 8,
    titre: 'Mariage Complet',
    prix: '1 200€', sousTitre: "/ jour · préparation jusqu'à la pièce montée",
    badge: 'Le plus complet', populaire: true,
    details: [
      "Du début des préparatifs jusqu'à la pièce montée",
      '200 photos retouchées HD',
      'Photos numériques HD supplémentaires',
      'Fichiers haute résolution',
    ],
  },
]

async function seed () {
  try {
    console.log('🌱 Début du seed...\n')

    await prisma.prestation.deleteMany({})
    console.log('🗑️  Prestations existantes supprimées')

    for (const p of PRESTATIONS) {
      await prisma.prestation.create({ data: p })
      console.log(`  ✅ ${p.titre} — ${p.prix}`)
    }

    console.log(`\n✅ ${PRESTATIONS.length} prestations insérées avec succès !`)

    console.log('\n🖼️  Couvertures de thème...')
    for (const c of COUVERTURES_DEFAULT) {
      await prisma.themeCouverture.upsert({
        where: { theme: c.theme },
        update: {},  // Ne pas écraser si déjà customisé
        create: { theme: c.theme, url: c.url, publicId: '', alt: c.alt }
      })
    }
    console.log('  ✅ 8 couvertures insérées')

    // ─── Config par défaut ─────────────────────────────────────────────────────
    const defaultConfigs = [
      { cle: 'hero_titre',      valeur: 'Je capture l\'émotion brute' },
      { cle: 'hero_sous_titre', valeur: 'Photographe professionnel' },
      { cle: 'hero_description',valeur: 'La lumière fugace, les fragments de vie qui font une histoire.' },
      { cle: 'bio_titre',       valeur: 'L\'Atelier' },
      { cle: 'bio_sous_titre',  valeur: 'Photographe professionnel basé à Port-de-Bouc' },
      { cle: 'bio_description', valeur: 'Passionné par la photographie depuis plus de 7 ans, je capture chaque instant avec authenticité et créativité.' },
      { cle: 'bio_ind1_val',    valeur: '500+' },
      { cle: 'bio_ind1_label',  valeur: 'Séances réalisées' },
      { cle: 'bio_ind2_val',    valeur: '7' },
      { cle: 'bio_ind2_label',  valeur: 'Années d\'expérience' },
      { cle: 'bio_ind3_val',    valeur: '100%' },
      { cle: 'bio_ind3_label',  valeur: 'Passion' },
      { cle: 'bio_citation',    valeur: 'La photographie est l\'art de figer l\'éternité dans un instant.' },
    ]

    for(const config of defaultConfigs) {
      const exists = await prisma.siteConfig.findUnique({ where: { cle: config.cle } })
      if(!exists) {
        await prisma.siteConfig.create({ data: config })
        console.log(`  ✅ Config ${config.cle} créée`)
      }
    }

    console.log('👉 Tu peux maintenant lancer : npm run dev')
  } catch (err) {
    console.error('❌ Erreur seed :', err)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

seed()
