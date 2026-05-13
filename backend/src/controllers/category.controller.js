const prisma = require('../config/db')
const { success, error } = require('../utils/response.util')
const { generateSlug } = require('../utils/slug.util')

exports.getAll = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { _count: { select: { items: true } } } })
    return success(res, categories)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.create = async (req, res) => {
  try {
    const slug = generateSlug(req.body.name)
    const category = await prisma.category.create({ data: { ...req.body, slug } })
    return success(res, category, 'Thêm danh mục thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.remove = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } })
    return success(res, null, 'Xóa danh mục thành công')
  } catch (err) {
    return error(res, err.message)
  }
}
