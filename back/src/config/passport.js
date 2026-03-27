const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value

      // ── Whitelist : emails autorisés séparés par une virgule dans ADMIN_EMAILS ─
      const allowed = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '')
        .split(',').map(e => e.trim()).filter(Boolean)
      if (!allowed.includes(email)) {
        return done(null, false, { message: 'Accès refusé' })
      }

      return done(null, {
        id:    profile.id,
        email,
        name:  profile.displayName,
        photo: profile.photos?.[0]?.value ?? null,
      })
    }
  )
)

// Sérialisation session
passport.serializeUser((user, done)   => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

module.exports = passport
