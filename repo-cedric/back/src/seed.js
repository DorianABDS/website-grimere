// ─── Seed : insère les 8 prestations en base ─────────────────────────────
// Lancer UNE SEULE FOIS après npm run db:push :  npm run db:seed

require('dotenv').config()
const prisma = require('./config/prisma')

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
    console.log('👉 Tu peux maintenant lancer : npm run dev')
  } catch (err) {
    console.error('❌ Erreur seed :', err)
  } finally {
    await prisma.$disconnect()
    process.exit(0)
  }
}

seed()
