const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const { success, error } = require('../utils/response.util')

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return error(res, 'Email đã được sử dụng', 409)
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({ data: { name, email, password: hashed } })
    const token = generateToken(user.id)
    return success(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Đăng ký thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return error(res, 'Email hoặc mật khẩu không đúng', 401)
    const match = await bcrypt.compare(password, user.password)
    if (!match) return error(res, 'Email hoặc mật khẩu không đúng', 401)
    const token = generateToken(user.id)
    return success(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Đăng nhập thành công')
  } catch (err) {
    return error(res, err.message)
  }
}

exports.getMe = async (req, res) => {
  return success(res, { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role })
}
