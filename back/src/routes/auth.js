const express  = require('express')
const passport = require('passport')
const router   = express.Router()

// ── Lance la connexion Google ─────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// ── Callback après authentification ──────────────────────────────────────
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/admin/login.html?error=acces_refuse`,
  }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/admin/dashboard.html`)
  }
)

// ── Vérifier si la session est active ────────────────────────────────────
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ connecte: true, user: req.user })
  } else {
    res.json({ connecte: false })
  }
})

// ── Déconnexion ───────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.json({ message: 'Déconnecté avec succès.' })
    })
  })
})

module.exports = router
