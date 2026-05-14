const prisma = require('../config/db')
const { generateSlug } = require('../utils/slug.util')

// Tạo slug unique (tự thêm số nếu trùng)
exports.createUniqueSlug = async (name) => {
  let slug = generateSlug(name)
  let exists = await prisma.menuItem.findUnique({ where: { slug } })
  let count = 1
  while (exists) {
    slug = `${generateSlug(name)}-${count}`
    exists = await prisma.menuItem.findUnique({ where: { slug } })
    count++
  }
  return slug
}

// Lấy menu kèm số lượng đã bán
exports.getMenuWithSalesCount = async (categoryId) => {
  const where = categoryId ? { categoryId: Number(categoryId), isAvailable: true } : { isAvailable: true }

  const items = await prisma.menuItem.findMany({
    where,
    include: {
      category: true,
      orderItems: { select: { quantity: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return items.map(item => ({
    ...item,
    totalSold: item.orderItems.reduce((sum, oi) => sum + oi.quantity, 0),
    orderItems: undefined // Không trả về raw orderItems
  }))
}

// Tìm kiếm món theo tên
exports.searchMenu = async (keyword) => {
  return prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      name: { contains: keyword, mode: 'insensitive' }
    },
    include: { category: true },
    take: 10
  })
}