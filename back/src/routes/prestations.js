const express = require('express')
const router  = express.Router()
const prisma  = require('../config/prisma')
const { isAdmin } = require('../middleware/auth')

// ── GET /api/prestations — forfaits actifs (public) ───────────────────────
router.get('/', async (req, res) => {
  try {
    const data = await prisma.prestation.findMany({
      where:   { actif: true },
      orderBy: { ordre: 'asc' },
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── GET /api/prestations/tous — tous les forfaits (admin) ─────────────────
router.get('/tous', isAdmin, async (req, res) => {
  try {
    const data = await prisma.prestation.findMany({ orderBy: { ordre: 'asc' } })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── POST /api/prestations — créer un forfait (admin) ─────────────────────
router.post('/', isAdmin, async (req, res) => {
  try {
    const data = await prisma.prestation.create({ data: req.body })
    res.status(201).json({ message: 'Forfait créé.', data })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PUT /api/prestations/:id — modifier un forfait (admin) ────────────────
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { titre, prix, sousTitre, details, badge, populaire, ordre, categorie } = req.body
    const data = await prisma.prestation.update({
      where: { id: req.params.id },
      data:  { titre, prix, sousTitre, details, badge, populaire, ordre, categorie },
    })
    res.json({ message: 'Forfait mis à jour.', data })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/prestations/:id/statut — activer/désactiver (admin) ────────
router.patch('/:id/statut', isAdmin, async (req, res) => {
  try {
    const current = await prisma.prestation.findUnique({ where: { id: req.params.id } })
    if (!current) return res.status(404).json({ message: 'Forfait introuvable.' })

    const data = await prisma.prestation.update({
      where: { id: req.params.id },
      data:  { actif: !current.actif },
    })
    res.json({ message: `Forfait ${data.actif ? 'activé' : 'désactivé'}.`, data })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── DELETE /api/prestations/:id — supprimer un forfait (admin) ────────────
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await prisma.prestation.delete({ where: { id: req.params.id } })
    res.json({ message: 'Forfait supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
