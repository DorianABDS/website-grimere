const express    = require('express')
const router     = express.Router()
const prisma     = require('../config/prisma')
const cloudinary = require('../config/cloudinary')
const sharp      = require('sharp')
const { upload } = require('../middleware/upload')
const { isAdmin } = require('../middleware/auth')

// GET /api/config/hero — retourner l'URL du hero (public)
router.get('/hero', async (req, res) => {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { cle: 'hero_url' } })
    res.json({ url: config?.valeur || null })
  } catch(e) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT /api/config/hero — uploader un nouveau background hero (admin)
router.put('/hero', isAdmin, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Photo requise.' })

    // Supprimer l'ancienne de Cloudinary
    const ancienne = await prisma.siteConfig.findUnique({ where: { cle: 'hero_public_id' } })
    if (ancienne?.valeur) {
      try { await cloudinary.uploader.destroy(ancienne.valeur) } catch(e) {}
    }

    // Compression Sharp avant upload (max 1920px, WebP 82%)
    const compressed = await sharp(req.file.buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()

    // Upload sur Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `${process.env.CLOUDINARY_FOLDER}/hero`, resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      )
      stream.end(compressed)
    })

    // Sauvegarder en DB
    await prisma.siteConfig.upsert({
      where: { cle: 'hero_url' },
      update: { valeur: result.secure_url },
      create: { cle: 'hero_url', valeur: result.secure_url }
    })
    await prisma.siteConfig.upsert({
      where: { cle: 'hero_public_id' },
      update: { valeur: result.public_id },
      create: { cle: 'hero_public_id', valeur: result.public_id }
    })

    res.json({ url: result.secure_url })
  } catch(e) {
    console.error(e)
    res.status(500).json({ message: 'Erreur upload hero.' })
  }
})

// GET /api/config/hero-content — retourner le contenu textuel du hero (public)
router.get('/hero-content', async (req, res) => {
  try {
    const keys = ['hero_titre', 'hero_sous_titre', 'hero_description']
    const configs = await prisma.siteConfig.findMany({ where: { cle: { in: keys } } })
    const data = {}
    configs.forEach(c => data[c.cle] = c.valeur)
    res.json(data)
  } catch(e) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT /api/config/hero-content — mettre à jour le contenu textuel du hero (admin)
router.put('/hero-content', isAdmin, async (req, res) => {
  try {
    const { hero_titre, hero_sous_titre, hero_description } = req.body
    const updates = { hero_titre, hero_sous_titre, hero_description }
    await Promise.all(
      Object.entries(updates)
        .filter(([_, v]) => v !== undefined)
        .map(([cle, valeur]) => prisma.siteConfig.upsert({
          where: { cle },
          update: { valeur },
          create: { cle, valeur }
        }))
    )
    res.json({ ok: true })
  } catch(e) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// GET /api/config/biographie — retourner le contenu de la biographie (public)
router.get('/biographie', async (req, res) => {
  try {
    const keys = ['bio_titre','bio_sous_titre','bio_description','bio_ind1_val','bio_ind1_label','bio_ind2_val','bio_ind2_label','bio_ind3_val','bio_ind3_label','bio_citation','bio_photo']
    const configs = await prisma.siteConfig.findMany({ where: { cle: { in: keys } } })
    const data = {}
    configs.forEach(c => data[c.cle] = c.valeur)
    res.json(data)
  } catch(e) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// PUT /api/config/biographie — mettre à jour la biographie avec upload photo optionnel (admin)
router.put('/biographie', isAdmin, upload.single('photo'), async (req, res) => {
  try {
    const fields = ['bio_titre','bio_sous_titre','bio_description','bio_ind1_val','bio_ind1_label','bio_ind2_val','bio_ind2_label','bio_ind3_val','bio_ind3_label','bio_citation']
    const updates = {}
    fields.forEach(f => { if(req.body[f] !== undefined) updates[f] = req.body[f] })

    // Upload photo si présente
    if(req.file) {
      const ancienne = await prisma.siteConfig.findUnique({ where: { cle: 'bio_photo_public_id' } })
      if(ancienne?.valeur) {
        try { await cloudinary.uploader.destroy(ancienne.valeur) } catch(e) {}
      }
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `${process.env.CLOUDINARY_FOLDER}/biographie`, resource_type: 'image' },
          (err, result) => err ? reject(err) : resolve(result)
        )
        stream.end(req.file.buffer)
      })
      updates['bio_photo'] = result.secure_url
      updates['bio_photo_public_id'] = result.public_id
    }

    await Promise.all(
      Object.entries(updates).map(([cle, valeur]) => prisma.siteConfig.upsert({
        where: { cle },
        update: { valeur },
        create: { cle, valeur }
      }))
    )
    res.json({ ok: true, photo: updates['bio_photo'] })
  } catch(e) {
    console.error(e)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
