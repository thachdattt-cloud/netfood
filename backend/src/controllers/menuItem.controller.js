const prisma = require('../config/db')
const { success, error, paginated } = require('../utils/response.util')
const { getPagination } = require('../utils/pagination.util')
const menuService = require('../services/menu.service')
const { deleteFile, getImageUrl } = require('../services/upload.service')

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

exports.search = async (req, res) => {
  try {
    const items = await menuService.searchMenu(req.query.q || '')
    return success(res, items)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.create = async (req, res) => {
  try {
    const slug = await menuService.createUniqueSlug(req.body.name)
    let imageUrl = req.body.image || null
    if (req.file) imageUrl = getImageUrl(req, req.file.filename)
    const item = await prisma.menuItem.create({
      data: { ...req.body, slug, image: imageUrl, price: Number(req.body.price), categoryId: Number(req.body.categoryId) },
      include: { category: true }
    })
    return success(res, item, 'Thêm món thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.update = async (req, res) => {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: Number(req.params.id) } })
    if (!existing) return error(res, 'Không tìm thấy món', 404)
    let imageUrl = req.body.image || existing.image
    if (req.file) {
      if (existing.image && existing.image.includes('/uploads/')) deleteFile(existing.image)
      imageUrl = getImageUrl(req, req.file.filename)
    }
    const item = await prisma.menuItem.update({
      where: { id: Number(req.params.id) },
      data: { ...req.body, image: imageUrl, price: Number(req.body.price), categoryId: Number(req.body.categoryId) },
      include: { category: true }
    })
    return success(res, item, 'Cập nhật thành công')
  } catch (err) {
    return error(res, err.message)
  }
}

exports.remove = async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: Number(req.params.id) } })
    if (item?.image && item.image.includes('/uploads/')) deleteFile(item.image)
    await prisma.menuItem.delete({ where: { id: Number(req.params.id) } })
    return success(res, null, 'Xóa thành công')
  } catch (err) {
    return error(res, err.message)
  }
}

// Toggle còn hàng / hết hàng
exports.toggleAvailable = async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: Number(req.params.id) } })
    if (!item) return error(res, 'Không tìm thấy món', 404)
    const updated = await prisma.menuItem.update({
      where: { id: Number(req.params.id) },
      data: { isAvailable: !item.isAvailable }
    })
    // Thông báo realtime cho kitchen và admin
    const io = req.app.get('io')
    io.emit('menu_availability_changed', { itemId: updated.id, name: updated.name, isAvailable: updated.isAvailable })
    return success(res, updated, updated.isAvailable ? 'Đã bật còn hàng' : 'Đã tắt — hết hàng')
  } catch (err) {
    return error(res, err.message)
  }
}

// Bếp báo hết hàng → admin nhận thông báo + tự động tắt món
exports.reportOutOfStock = async (req, res) => {
  try {
    const { itemId, message } = req.body
    const item = await prisma.menuItem.findUnique({ where: { id: Number(itemId) } })
    if (!item) return error(res, 'Không tìm thấy món', 404)

    // Tự động tắt món
    await prisma.menuItem.update({ where: { id: Number(itemId) }, data: { isAvailable: false } })

    // Gửi thông báo realtime đến admin
    const io = req.app.get('io')
    io.to('admin').emit('kitchen_alert', {
      type: 'OUT_OF_STOCK',
      itemId: item.id,
      itemName: item.name,
      message: message || `Bếp báo hết món: ${item.name}`,
      time: new Date()
    })
    io.emit('menu_availability_changed', { itemId: item.id, name: item.name, isAvailable: false })

    return success(res, null, `Đã báo admin và tắt món "${item.name}"`)
  } catch (err) {
    return error(res, err.message)
  }
}