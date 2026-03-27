const express = require('express')
const router  = express.Router()
const prisma  = require('../config/prisma')
const { isAdmin } = require('../middleware/auth')
const { sendAvisNotification } = require('../config/mailer')

// ── GET /api/avis — avis approuvés (public) ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const data = await prisma.avis.findMany({
      where:   { statut: 'APPROUVE' },
      orderBy: { createdAt: 'desc' },
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── GET /api/avis/tous — tous les avis (admin) ────────────────────────────
router.get('/tous', isAdmin, async (req, res) => {
  try {
    const data = await prisma.avis.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── POST /api/avis — soumettre un avis (public) ───────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nom, prestation, note, commentaire } = req.body

    if (!nom?.trim() || !prestation?.trim() || !note || !commentaire?.trim()) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires.' })
    }
    const n = parseInt(note)
    if (n < 1 || n > 5) {
      return res.status(400).json({ message: 'La note doit être entre 1 et 5.' })
    }

    const avis = await prisma.avis.create({
      data: { nom: nom.trim(), prestation: prestation.trim(), note: n, commentaire: commentaire.trim() },
    })

    // Notifier Cédric sans bloquer la réponse
    sendAvisNotification({ nom, note: n, commentaire, prestation }).catch(console.error)

    res.status(201).json({
      message: 'Merci ! Votre avis est en cours de modération.',
      id: avis.id,
    })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PATCH /api/avis/:id/statut — approuver ou refuser (admin) ────────────
router.patch('/:id/statut', isAdmin, async (req, res) => {
  try {
    const { statut } = req.body
    if (!['APPROUVE', 'REFUSE'].includes(statut)) {
      return res.status(400).json({ message: 'Statut invalide. Valeurs : APPROUVE | REFUSE' })
    }
    const avis = await prisma.avis.update({
      where: { id: req.params.id },
      data:  { statut },
    })
    res.json({ message: `Avis ${statut === 'APPROUVE' ? 'approuvé' : 'refusé'}.`, avis })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── PUT /api/avis/:id — modifier avant publication (admin) ────────────────
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const avis = await prisma.avis.update({
      where: { id: req.params.id },
      data:  req.body,
    })
    res.json({ message: 'Avis modifié.', avis })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

// ── DELETE /api/avis/:id — supprimer (admin) ──────────────────────────────
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const count = await prisma.avis.deleteMany({ where: { id: req.params.id } })
    if (count.count === 0) return res.status(404).json({ message: 'Avis introuvable.' })
    res.json({ message: 'Avis supprimé.' })
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
