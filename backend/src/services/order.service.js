const prisma = require('../config/db')

// Tính tổng tiền đơn hàng
exports.calculateTotal = (items, menuItems) => {
  return items.reduce((sum, item) => {
    const menuItem = menuItems.find(m => m.id === item.menuItemId)
    return sum + (Number(menuItem?.price || 0) * item.quantity)
  }, 0)
}

// Lấy thống kê đơn hàng theo ngày
exports.getDailyStats = async (date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { not: 'CANCELLED' }
    },
    include: { items: { include: { menuItem: true } } }
  })

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalOrders = orders.length
  const avgOrder = totalOrders ? revenue / totalOrders : 0

  // Top món bán chạy
  const itemCount = {}
  orders.forEach(order => {
    order.items.forEach(item => {
      const name = item.menuItem?.name || 'Unknown'
      itemCount[name] = (itemCount[name] || 0) + item.quantity
    })
  })
  const topItems = Object.entries(itemCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return { revenue, totalOrders, avgOrder, topItems }
}

// Lấy đơn hàng đang active (chưa giao)
exports.getActiveOrders = async () => {
  return prisma.order.findMany({
    where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } },
    include: {
      items: { include: { menuItem: true } },
      table: true,
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'asc' }
  })
}

// Kiểm tra món còn hàng không
exports.checkAvailability = async (items) => {
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map(i => i.menuItemId) } }
  })

  const unavailable = []
  for (const item of items) {
    const menuItem = menuItems.find(m => m.id === item.menuItemId)
    if (!menuItem) unavailable.push({ id: item.menuItemId, reason: 'Không tìm thấy món' })
    else if (!menuItem.isAvailable) unavailable.push({ id: item.menuItemId, name: menuItem.name, reason: 'Món đã hết hàng' })
  }

  return { menuItems, unavailable }
}