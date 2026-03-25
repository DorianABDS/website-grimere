const { PrismaClient } = require('@prisma/client')

// Singleton — évite les connexions multiples en développement (hot reload)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

module.exports = prisma
