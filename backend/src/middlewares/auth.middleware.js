const jwt = require('jsonwebtoken')
const prisma = require('../config/db')

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, message: 'Chưa đăng nhập' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!req.user) return res.status(401).json({ success: false, message: 'Token không hợp lệ' })
    next()
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token hết hạn hoặc không hợp lệ' })
  }
}
