const express = require('express')
const router  = express.Router()
const prisma  = require('../config/prisma')
const { isAdmin } = require('../middleware/auth')

// ── GET /api/messages — messages non archivés (admin) ─────────────────────
router.get('/', isAdmin, async (req, res) => {
  try {
    const data = await prisma.message.findMany({
      where:   { archive: false },
      orderBy: { createdAt: 'desc' },
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── GET /api/messages/archives — messages archivés (admin) ────────────────
router.get('/archives', isAdmin, async (req, res) => {
  try {
    const data = await prisma.message.findMany({
      where:   { archive: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/messages/:id/lu — basculer lu/non lu (admin) ───────────────
router.patch('/:id/lu', isAdmin, async (req, res) => {
  try {
    const current = await prisma.message.findUnique({ where: { id: req.params.id } })
    if (!current) return res.status(404).json({ message: 'Message introuvable.' })

    const data = await prisma.message.update({
      where: { id: req.params.id },
      data:  { lu: !current.lu },
    })
    res.json({ message: `Message marqué comme ${data.lu ? 'lu' : 'non lu'}.`, data })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/messages/:id/archive — archiver (admin) ────────────────────
router.patch('/:id/archive', isAdmin, async (req, res) => {
  try {
    const data = await prisma.message.update({
      where: { id: req.params.id },
      data:  { archive: true, lu: true },
    })
    res.json({ message: 'Message archivé.', data })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── DELETE /api/messages/:id — supprimer définitivement (admin) ───────────
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } })
    res.json({ message: 'Message supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
