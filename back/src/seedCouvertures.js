const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const COUVERTURES = [
  { theme: 'mariage',    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', alt: 'Cérémonie de mariage' },
  { theme: 'naissance',  url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80',  alt: 'Séance naissance nouveau-né' },
  { theme: 'portrait',   url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80', alt: 'Portrait lumière naturelle' },
  { theme: 'animalier',  url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', alt: 'Portrait chien golden retriever' },
  { theme: 'culinaire',  url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', alt: 'Plat gastronomique' },
  { theme: 'evenement',  url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', alt: 'Événement entreprise' },
  { theme: 'bapteme',    url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80', alt: 'Cérémonie de baptême' },
  { theme: 'babyshower', url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80', alt: 'Décoration baby shower' },
]

async function seedCouvertures() {
  for (const c of COUVERTURES) {
    await prisma.themeCouverture.upsert({
      where:  { theme: c.theme },
      update: {},
      create: { theme: c.theme, url: c.url, publicId: '', alt: c.alt },
    })
    console.log(`  ✅ ${c.theme}`)
  }
}

seedCouvertures()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
