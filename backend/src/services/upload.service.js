const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

// Cấu hình lưu file local
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, name)
  }
})

// Chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF)'), false)
}

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Tối đa 5MB
})

// Xóa file cũ khi cập nhật ảnh
exports.deleteFile = (filename) => {
  if (!filename) return
  const filepath = path.join(uploadDir, path.basename(filename))
  if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
}

// Trả về URL public của ảnh
exports.getImageUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`
}