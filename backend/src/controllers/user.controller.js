const prisma = require('../config/db')
const bcrypt = require('bcryptjs')
const { success, error, paginated } = require('../utils/response.util')
const { getPagination } = require('../utils/pagination.util')

exports.getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip, take: limit,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ])
    return paginated(res, users, { total, page, limit })
  } catch (err) {
    return error(res, err.message)
  }
}

exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return error(res, 'Email đã tồn tại', 409)
    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    })
    return success(res, user, 'Tạo tài khoản thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.updateRole = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role: req.body.role },
      select: { id: true, name: true, email: true, role: true }
    })
    return success(res, user, 'Cập nhật role thành công')
  } catch (err) {
    return error(res, err.message)
  }
}

exports.remove = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: Number(req.params.id) } })
    return success(res, null, 'Xóa tài khoản thành công')
  } catch (err) {
    return error(res, err.message)
  }
}