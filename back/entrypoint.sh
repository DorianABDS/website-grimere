#!/bin/sh
set -e

# Appliquer le schéma Prisma
echo "📦 Application du schéma..."
npx prisma db push --skip-generate

echo "✅ Tables créées"

# Seed uniquement si la table Prestation est vide
COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
p.prestation.count().then(n => { console.log(n); p.\$disconnect() }).catch(() => { console.log('0'); process.exit(0) })
" 2>/dev/null || echo "0")

if [ "$COUNT" = "0" ]; then
  echo "🌱 Insertion des prestations..."
  node src/seed.js
  echo "✅ Seed terminé"
else
  echo "✅ Base déjà peuplée ($COUNT prestations)"
fi

echo "🚀 Démarrage du serveur..."
exec node src/server.js