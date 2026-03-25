# Cédric Grimere — Portfolio Photographe

Site web complet avec interface d'administration.

## Structure

```
cedric-grimere/
├── front/              ← Site public
│   ├── index.html
│   └── config.js       ← Changer API_URL ici pour la prod
├── admin/              ← Interface admin
│   ├── login.html
│   ├── dashboard.html
│   └── config.js       ← Changer API_URL ici pour la prod
├── back/               ← API REST Node.js + PostgreSQL
│   └── README.md       ← Guide d'installation complet
├── render.yaml         ← Config déploiement Render
└── .gitignore
```

## Démarrage rapide

```bash
# Backend
cd back
npm install
cp .env.example .env
# Remplir le .env (voir back/README.md)
npm run db:push
npm run db:seed
npm run dev
```

Ouvrir `front/index.html` et `admin/login.html` dans le navigateur.

> Guide complet de déploiement → **back/README.md**
