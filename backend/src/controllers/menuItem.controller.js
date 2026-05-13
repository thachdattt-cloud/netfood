const prisma = require('../config/db')
const { success, error, paginated } = require('../utils/response.util')
const { getPagination } = require('../utils/pagination.util')
const { generateSlug } = require('../utils/slug.util')

exports.getAll = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const where = req.query.categoryId ? { categoryId: Number(req.query.categoryId) } : {}
    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({ where, skip, take: limit, include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.menuItem.count({ where })
    ])
    return paginated(res, items, { total, page, limit })
  } catch (err) {
    return error(res, err.message)
  }
}

exports.getOne = async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { slug: req.params.slug }, include: { category: true } })
    if (!item) return error(res, 'Không tìm thấy món', 404)
    return success(res, item)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.create = async (req, res) => {
  try {
    const slug = generateSlug(req.body.name)
    const item = await prisma.menuItem.create({ data: { ...req.body, slug }, include: { category: true } })
    return success(res, item, 'Thêm món thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.update = async (req, res) => {
  try {
    const item = await prisma.menuItem.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { category: true }
    })
    return success(res, item, 'Cập nhật thành công')
  } catch (err) {
    return error(res, err.message)
  }
}

exports.remove = async (req, res) => {
  try {
    await prisma.menuItem.delete({ where: { id: Number(req.params.id) } })
    return success(res, null, 'Xóa thành công')
  } catch (err) {
    return error(res, err.message)
  }
}
