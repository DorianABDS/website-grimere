# Backend — Cédric Grimere Photographe

API REST · Node.js + Express + PostgreSQL (Prisma)

---

## Structure du projet

```
back/
├── prisma/
│   └── schema.prisma        ← Tables PostgreSQL (Photo, Prestation, Avis, Message)
├── src/
│   ├── config/
│   │   ├── prisma.js        ← Client PostgreSQL singleton
│   │   ├── passport.js      ← Google OAuth 2.0 + whitelist email
│   │   ├── cloudinary.js    ← Stockage et suppression des photos
│   │   └── mailer.js        ← 3 templates email HTML
│   ├── middleware/
│   │   ├── auth.js          ← Protection des routes admin
│   │   └── upload.js        ← Upload Multer + conversion WebP (Sharp)
│   ├── routes/
│   │   ├── auth.js          ← Connexion/déconnexion Google
│   │   ├── contact.js       ← Formulaire de contact
│   │   ├── galerie.js       ← CRUD photos + drag & drop + changement thème
│   │   ├── prestations.js   ← CRUD forfaits
│   │   ├── avis.js          ← Soumission + modération avis
│   │   ├── messages.js      ← Boîte de réception admin
│   │   └── stats.js         ← Statistiques dashboard
│   ├── seed.js              ← Insère les 8 prestations (1 seule fois)
│   └── server.js            ← Point d'entrée
├── uploads/temp/            ← Stockage temporaire avant Cloudinary
├── .env.example             ← Variables à configurer
├── .gitignore
└── package.json
```

---

## Installation complète pas à pas

### Prérequis
- Node.js v18 ou supérieur
- Un compte Supabase (gratuit) → https://supabase.com
- Un compte Cloudinary (gratuit) → https://cloudinary.com
- Un compte Google Cloud Console → https://console.cloud.google.com

---

### Étape 1 — Cloner et installer

```bash
cd back
npm install
cp .env.example .env
```

---

### Étape 2 — Supabase (base de données PostgreSQL)

1. Aller sur https://supabase.com → créer un compte
2. **New Project** → nom : `cedric-grimere` → choisir un mot de passe fort → région : **West EU (Ireland)**
3. Attendre ~2 minutes que le projet se crée
4. Aller dans **Settings → Database → Connection string → URI**
5. Copier l'URL et remplacer `[YOUR-PASSWORD]` par ton mot de passe
6. Coller dans `.env` → `DATABASE_URL=postgresql://...`

---

### Étape 3 — Cloudinary (stockage photos)

1. Aller sur https://cloudinary.com → créer un compte gratuit
2. Sur le Dashboard, noter les 3 valeurs :
   - **Cloud Name**
   - **API Key**
   - **API Secret** (cliquer sur "Reveal")
3. Coller dans `.env` → `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---

### Étape 4 — Google Cloud Console (connexion admin)

1. Aller sur https://console.cloud.google.com
2. **New Project** → nom : `cedric-grimere-photo` → **Create**
3. Menu → **APIs & Services → Library** → chercher **"Google+ API"** → Enable
4. Menu → **APIs & Services → Credentials → + Create Credentials → OAuth client ID**
5. Si demandé, configurer l'écran de consentement :
   - User Type : **External**
   - App name : `Cédric Grimere Admin`
   - Email : ton Gmail
   - Sauvegarder
6. Application type : **Web application**
7. **Authorized redirect URIs** → Add URI :
   - `http://localhost:5000/api/auth/google/callback` (dev)
   - `https://ton-back.railway.app/api/auth/google/callback` (prod, à ajouter plus tard)
8. Cliquer **Create** → noter le **Client ID** et **Client Secret**
9. Coller dans `.env` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
10. Mettre ton Gmail dans `ADMIN_EMAIL`

---

### Étape 5 — Mot de passe d'application Gmail (pour les emails)

> Hotmail peut bloquer SMTP. Utilise un Gmail avec un App Password.

1. Aller sur https://myaccount.google.com/security
2. Activer la **validation en 2 étapes** si pas déjà fait
3. Chercher **"App passwords"** → **Mail** → **Other** → nommer `cedric-grimere`
4. Copier le mot de passe généré (format : `xxxx xxxx xxxx xxxx`)
5. Coller dans `.env` → `MAIL_PASS=xxxx xxxx xxxx xxxx`

---

### Étape 6 — Générer le SESSION_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copier la valeur dans `.env` → `SESSION_SECRET`

---

### Étape 7 — Créer les tables et peupler la base

```bash
# Crée toutes les tables dans Supabase
npm run db:push

# Insère les 8 forfaits (une seule fois)
npm run db:seed
```

---

### Étape 8 — Lancer en développement

```bash
npm run dev
```

Tester que tout fonctionne :
```
GET http://localhost:5000/api/health
→ { "status": "OK", "message": "Serveur Cédric Grimere..." }

GET http://localhost:5000/api/prestations
→ [ { "titre": "Naissance...", ... }, ... ]
```

---

### Étape 9 — Visualiser la base de données

```bash
npm run db:studio
# Ouvre une interface web sur http://localhost:5555
# Permet de voir et modifier toutes les données
```

---

## Déploiement sur Render (gratuit à vie)

### Étape 1 — Créer le service

1. Créer un compte sur https://render.com → se connecter avec GitHub
2. **New → Web Service**
3. Connecter le repo GitHub → sélectionner le repo
4. Configurer :
   - **Name** : `cedric-grimere-back`
   - **Root Directory** : `back`
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npx prisma generate`
   - **Start Command** : `npm start`
   - **Plan** : `Free`

### Étape 2 — Variables d'environnement

Dans **Environment → Add Environment Variables**, ajouter toutes les variables du `.env` en changeant :
```
NODE_ENV=production
GOOGLE_CALLBACK_URL=https://cedric-grimere-back.onrender.com/api/auth/google/callback
FRONTEND_URL=https://cedricgrimere.fr
BACKEND_URL=https://cedric-grimere-back.onrender.com
```

### Étape 3 — Appliquer le schéma en production

Une fois déployé, aller dans **Shell** sur Render et lancer :
```bash
npx prisma db push
node src/seed.js
```

### Étape 4 — Google Cloud Console

Ajouter la nouvelle URL de callback dans les redirect URIs autorisés :
```
https://cedric-grimere-back.onrender.com/api/auth/google/callback
```

### Étape 5 — UptimeRobot (garde le serveur éveillé, gratuit)

> Render endort le serveur après 15 min d'inactivité.
> UptimeRobot le pingue toutes les 5 min pour éviter ça.

1. Créer un compte sur https://uptimerobot.com
2. **Add New Monitor**
   - Monitor Type : **HTTP(s)**
   - Friendly Name : `Cedric Grimere Backend`
   - URL : `https://cedric-grimere-back.onrender.com/api/health`
   - Monitoring Interval : **5 minutes**
3. Cliquer **Create Monitor**

✅ Le serveur reste éveillé en permanence, aucun délai pour les visiteurs.

---

## Routes API complètes

### 🌐 Publiques

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health` | Santé du serveur |
| `GET` | `/api/auth/google` | Lance la connexion Google |
| `GET` | `/api/auth/me` | Vérifie la session |
| `POST` | `/api/auth/logout` | Déconnexion |
| `POST` | `/api/contact` | Envoyer un message |
| `GET` | `/api/galerie` | Toutes les photos par thème |
| `GET` | `/api/galerie/:theme` | Photos d'un thème |
| `GET` | `/api/prestations` | Forfaits actifs |
| `GET` | `/api/avis` | Avis approuvés |
| `POST` | `/api/avis` | Soumettre un avis |

### 🔒 Admin (session Google requise)

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/stats` | Statistiques dashboard |
| `POST` | `/api/galerie/upload` | Upload photos (WebP auto) |
| `DELETE` | `/api/galerie/:id` | Supprimer une photo |
| `PATCH` | `/api/galerie/reorder` | Sauvegarder l'ordre (drag & drop) |
| `PATCH` | `/api/galerie/:id/theme` | Changer le thème d'une photo |
| `PATCH` | `/api/galerie/:id/alt` | Modifier le texte alternatif |
| `GET` | `/api/prestations/tous` | Tous les forfaits |
| `POST` | `/api/prestations` | Créer un forfait |
| `PUT` | `/api/prestations/:id` | Modifier un forfait |
| `PATCH` | `/api/prestations/:id/statut` | Activer / désactiver |
| `DELETE` | `/api/prestations/:id` | Supprimer |
| `GET` | `/api/avis/tous` | Tous les avis |
| `PATCH` | `/api/avis/:id/statut` | Approuver / refuser |
| `PUT` | `/api/avis/:id` | Modifier avant publication |
| `DELETE` | `/api/avis/:id` | Supprimer |
| `GET` | `/api/messages` | Messages non archivés |
| `GET` | `/api/messages/archives` | Messages archivés |
| `PATCH` | `/api/messages/:id/lu` | Marquer lu / non lu |
| `PATCH` | `/api/messages/:id/archive` | Archiver |
| `DELETE` | `/api/messages/:id` | Supprimer définitivement |

---

## En cas de problème

| Problème | Solution |
|---------|---------|
| `Accès refusé` sur Google | Vérifier que `ADMIN_EMAIL` correspond exactement au Gmail utilisé |
| Erreur connexion BDD | Vérifier `DATABASE_URL`, le `?sslmode=require` est obligatoire sur Supabase |
| Photos ne s'uploadent pas | Vérifier les 3 clés Cloudinary dans `.env` |
| Emails non reçus | Vérifier `MAIL_PASS` — utiliser un App Password Gmail, pas le mot de passe du compte |
| Session perdue au rechargement | Vérifier `SESSION_SECRET` et que `connect-pg-simple` crée bien la table `sessions` |
