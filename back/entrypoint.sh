#!/bin/sh
set -e

# Appliquer le schéma Prisma (retry pour laisser le temps à Neon de se réveiller)
echo "📦 Application du schéma..."
for i in 1 2 3 4 5; do
  npx prisma db push --skip-generate && break
  echo "   Tentative $i échouée, retry dans 5s..."
  sleep 5
done

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