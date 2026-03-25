const express = require('express')
const router  = express.Router()
const prisma  = require('../config/prisma')
const { sendAdminNotification, sendClientConfirmation } = require('../config/mailer')

// ── POST /api/contact ─────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { nom, email, prestation = '', message } = req.body

    if (!nom?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Nom, email et message sont obligatoires.' })
    }

    // Sauvegarde en base
    const nouveauMessage = await prisma.message.create({
      data: { nom: nom.trim(), email: email.trim().toLowerCase(), prestation, message: message.trim() },
    })

    // Envoi emails en parallèle (non bloquant pour l'utilisateur)
    Promise.all([
      sendAdminNotification({ nom, email, prestation, message }),
      sendClientConfirmation({ nom, email, prestation }),
    ]).catch(err => console.error('Erreur email:', err))

    res.status(201).json({ message: 'Message envoyé avec succès.', id: nouveauMessage.id })
  } catch (err) {
    console.error('Erreur contact:', err)
    res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer.' })
  }
})

module.exports = router
