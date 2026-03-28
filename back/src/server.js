require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const session    = require('express-session')
const pgSession  = require('connect-pg-simple')(session)
const { Pool }   = require('pg')
const passport   = require('./config/passport')
const prisma     = require('./config/prisma')

// ─── Routes ───────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth')
const contactRoutes     = require('./routes/contact')
const galerieRoutes     = require('./routes/galerie')
const prestationsRoutes = require('./routes/prestations')
const avisRoutes        = require('./routes/avis')
const messagesRoutes    = require('./routes/messages')
const statsRoutes       = require('./routes/stats')
const siteConfigRoutes  = require('./routes/siteConfig')
const seedSiteConfig    = require('./seedSiteConfig')

const app = express()

// ─── Trust proxy Render ────────────────────────────────────────────────────
app.set('trust proxy', 1)

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.FRONTEND_URL,
  credentials: true,                    // Nécessaire pour les cookies de session
}))

// ─── Parsers ──────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Session stockée dans PostgreSQL ──────────────────────────────────────
const pgPool = new Pool({ connectionString: process.env.DATABASE_URL })

app.use(session({
  store: new pgSession({
    pool:                 pgPool,
    tableName:            'sessions',
    createTableIfMissing: true,         // Crée la table sessions si elle n'existe pas
  }),
  secret:            process.env.SESSION_SECRET,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    secure:   process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
    httpOnly: true,
    maxAge:   1000 * 60 * 60 * 24,                  // 24h
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}))

// ─── Passport (Google OAuth) ──────────────────────────────────────────────
app.use(passport.initialize())
app.use(passport.session())

// ─── Routes API ───────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/contact',     contactRoutes)
app.use('/api/galerie',     galerieRoutes)
app.use('/api/prestations', prestationsRoutes)
app.use('/api/avis',        avisRoutes)
app.use('/api/messages',    messagesRoutes)
app.use('/api/stats',       statsRoutes)
app.use('/api/config',      siteConfigRoutes)

// ─── Santé du serveur ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:    'OK',
    message:   `Serveur ${process.env.PHOTOGRAPHE_NOM || 'Photographe'} opérationnel`,
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV,
  })
})

// ─── Route inconnue ───────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} introuvable.` })
})

// ─── Gestionnaire d'erreurs global ────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Erreur non gérée :', err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur interne.' })
})

// ─── Démarrage ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`\n🚀 Serveur démarré → http://localhost:${PORT}`)
  console.log(`🗄️  Base de données  → PostgreSQL (Prisma)`)
  console.log(`🌍 Environnement    → ${process.env.NODE_ENV}`)
  console.log(`🔗 Frontend autorisé → ${process.env.FRONTEND_URL}\n`)
  await seedSiteConfig()
})

// ─── Fermeture propre ─────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n${signal} reçu — fermeture propre...`)
  await prisma.$disconnect()
  process.exit(0)
}
process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
