const multer = require('multer')
const sharp  = require('sharp')
const path   = require('path')
const fs     = require('fs')

// ─── Stockage en mémoire avant conversion ─────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/heic','image/tiff']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Format non supporté. Utilisez JPG, PNG, WebP, HEIC ou TIFF.'))
  },
})

// ─── Convertit le buffer en WebP optimisé via Sharp ───────────────────────
const convertToWebP = async (buffer, originalName) => {
  const tmpDir = path.join(__dirname, '../../uploads/temp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

  const base       = path.parse(originalName).name.replace(/\s+/g, '-').toLowerCase()
  const outputName = `${Date.now()}-${base}.webp`
  const outputPath = path.join(tmpDir, outputName)

  const info = await sharp(buffer)
    .webp({ quality: 85 })  // 85% : excellent ratio qualité/poids
    .toFile(outputPath)

  const { size } = fs.statSync(outputPath)

  return {
    outputPath,
    outputName,
    width:  info.width,
    height: info.height,
    size,
  }
}

module.exports = { upload, convertToWebP }
