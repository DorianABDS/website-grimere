const express    = require('express')
const router     = express.Router()
const prisma     = require('../config/prisma')
const cloudinary = require('../config/cloudinary')
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

    // Upload sur Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `${process.env.CLOUDINARY_FOLDER}/hero`, resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result)
      )
      stream.end(req.file.buffer)
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

module.exports = router
