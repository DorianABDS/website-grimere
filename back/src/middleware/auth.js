// ─── Middleware de protection des routes admin ────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next()
  }
  res.status(401).json({ message: 'Non authentifié. Veuillez vous connecter via /api/auth/google' })
}

module.exports = { isAdmin }
