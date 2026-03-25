const express = require('express')
const router  = express.Router()
const prisma  = require('../config/prisma')
const { isAdmin } = require('../middleware/auth')

// ── GET /api/stats — tableau de bord complet (admin) ──────────────────────
router.get('/', isAdmin, async (req, res) => {
  try {
    const debutMois = new Date()
    debutMois.setDate(1)
    debutMois.setHours(0, 0, 0, 0)

    const [
      totalPhotos,
      photosParTheme,
      dernierePhoto,
      totalPrestations,
      prestationsActives,
      totalAvis,
      avisEnAttente,
      noteMoyenne,
      totalMessages,
      messagesNonLus,
      messagesArchives,
      messagesCeMois,
      prestationTop,
    ] = await Promise.all([
      prisma.photo.count(),
      prisma.photo.groupBy({ by: ['theme'], _count: { id: true }, orderBy: { theme: 'asc' } }),
      prisma.photo.findFirst({ orderBy: { createdAt: 'desc' }, select: { url: true, theme: true, createdAt: true } }),
      prisma.prestation.count(),
      prisma.prestation.count({ where: { actif: true } }),
      prisma.avis.count({ where: { statut: 'APPROUVE' } }),
      prisma.avis.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.avis.aggregate({ where: { statut: 'APPROUVE' }, _avg: { note: true } }),
      prisma.message.count({ where: { archive: false } }),
      prisma.message.count({ where: { lu: false, archive: false } }),
      prisma.message.count({ where: { archive: true } }),
      prisma.message.count({ where: { createdAt: { gte: debutMois } } }),
      prisma.message.groupBy({
        by: ['prestation'],
        where: { prestation: { not: '' } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      }),
    ])

    res.json({
      galerie: {
        totalPhotos,
        photosParTheme: photosParTheme.map(p => ({ theme: p.theme, count: p._count.id })),
        dernierePhoto,
      },
      prestations: {
        total:        totalPrestations,
        actives:      prestationsActives,
        inactives:    totalPrestations - prestationsActives,
        plusDemandee: prestationTop[0]?.prestation ?? 'Aucune donnée',
        nbDemandes:   prestationTop[0]?._count.id  ?? 0,
      },
      avis: {
        total:       totalAvis,
        enAttente:   avisEnAttente,
        noteMoyenne: Math.round((noteMoyenne._avg.note ?? 0) * 10) / 10,
      },
      messages: {
        total:    totalMessages,
        nonLus:   messagesNonLus,
        archives: messagesArchives,
        ceMois:   messagesCeMois,
      },
    })
  } catch (err) {
    console.error('Erreur stats:', err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

module.exports = router
