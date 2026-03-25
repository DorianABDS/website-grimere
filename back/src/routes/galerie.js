const express    = require('express')
const router     = express.Router()
const fs         = require('fs')
const prisma     = require('../config/prisma')
const cloudinary = require('../config/cloudinary')
const { upload, convertToWebP } = require('../middleware/upload')
const { isAdmin } = require('../middleware/auth')

// ── GET /api/galerie — toutes les photos groupées par thème (public) ──────
router.get('/', async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      orderBy: [{ theme: 'asc' }, { ordre: 'asc' }],
    })
    // Grouper par thème
    const grouped = photos.reduce((acc, p) => {
      if (!acc[p.theme]) acc[p.theme] = []
      acc[p.theme].push(p)
      return acc
    }, {})
    res.json(grouped)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── GET /api/galerie/:theme — photos d'un thème (public) ──────────────────
router.get('/:theme', async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      where:   { theme: req.params.theme },
      orderBy: { ordre: 'asc' },
    })
    res.json(photos)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── POST /api/galerie/upload — upload photos (admin) ──────────────────────
router.post('/upload', isAdmin, upload.array('photos', 20), async (req, res) => {
  try {
    const { theme, alt = '' } = req.body
    if (!theme)            return res.status(400).json({ message: 'Thème obligatoire.' })
    if (!req.files?.length) return res.status(400).json({ message: 'Aucun fichier reçu.' })

    const created = []

    for (const file of req.files) {
      // 1. Convertir en WebP
      const { outputPath, width, height, size } = await convertToWebP(file.buffer, file.originalname)

      // 2. Upload Cloudinary
      const result = await cloudinary.uploader.upload(outputPath, {
        folder: `cedric-grimere/${theme}`,
        format: 'webp',
      })

      // 3. Supprimer le fichier temporaire local
      fs.unlinkSync(outputPath)

      // 4. Récupérer l'ordre max pour ce thème
      const last = await prisma.photo.findFirst({
        where: { theme }, orderBy: { ordre: 'desc' }, select: { ordre: true },
      })

      // 5. Sauvegarder en base
      const photo = await prisma.photo.create({
        data: {
          url:      result.secure_url,
          publicId: result.public_id,
          alt, theme,
          ordre:   (last?.ordre ?? -1) + 1,
          largeur: width, hauteur: height, taille: size,
        },
      })
      created.push(photo)
    }

    res.status(201).json({
      message: `${created.length} photo(s) uploadée(s) avec succès.`,
      photos:  created,
    })
  } catch (err) {
    console.error('Erreur upload:', err)
    res.status(500).json({ message: "Erreur lors de l'upload." })
  }
})

// ── DELETE /api/galerie/:id — supprime une photo (admin) ──────────────────
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const photo = await prisma.photo.findUnique({ where: { id: req.params.id } })
    if (!photo) return res.status(404).json({ message: 'Photo introuvable.' })

    await cloudinary.uploader.destroy(photo.publicId)
    await prisma.photo.delete({ where: { id: req.params.id } })

    res.json({ message: 'Photo supprimée.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/galerie/reorder — sauvegarde l'ordre après drag & drop (admin)
router.patch('/reorder', isAdmin, async (req, res) => {
  try {
    const { ordre } = req.body // [{ id, ordre }, ...]
    if (!Array.isArray(ordre)) return res.status(400).json({ message: 'Format invalide.' })

    // Transaction : tout réussit ou tout échoue
    await prisma.$transaction(
      ordre.map(({ id, ordre: o }) =>
        prisma.photo.update({ where: { id }, data: { ordre: o } })
      )
    )
    res.json({ message: 'Ordre sauvegardé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/galerie/:id/theme — déplace une photo vers un autre thème (admin)
router.patch('/:id/theme', isAdmin, async (req, res) => {
  try {
    const { theme } = req.body
    if (!theme) return res.status(400).json({ message: 'Thème obligatoire.' })

    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data:  { theme, ordre: 9999 },
    })
    res.json({ message: 'Thème mis à jour.', photo })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/galerie/:id/alt — modifie le texte alternatif (admin) ──────
router.patch('/:id/alt', isAdmin, async (req, res) => {
  try {
    const photo = await prisma.photo.update({
      where: { id: req.params.id },
      data:  { alt: req.body.alt ?? '' },
    })
    res.json(photo)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
