const prisma = require('../config/db')
const { success, error, paginated } = require('../utils/response.util')
const { getPagination } = require('../utils/pagination.util')

exports.createOrder = async (req, res) => {
  try {
    const { tableId, note, items } = req.body

    // Tính tổng tiền
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map(i => i.menuItemId) } }
    })
    const total = items.reduce((sum, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId)
      return sum + (menuItem?.price || 0) * item.quantity
    }, 0)

    const order = await prisma.order.create({
      data: {
        tableId,
        userId: req.user?.id || null,
        note,
        total,
        items: {
          create: items.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId)
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              note: item.note,
              price: menuItem.price
            }
          })
        }
      },
      include: { items: { include: { menuItem: true } }, table: true }
    })

    // Emit socket event để bếp nhận ngay
    const io = req.app.get('io')
    io.to('kitchen').emit('new_order', order)

    return success(res, order, 'Đặt hàng thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.getOrders = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const where = req.query.status ? { status: req.query.status } : {}
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: limit,
        include: { items: { include: { menuItem: true } }, table: true, user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])
    return paginated(res, orders, { total, page, limit })
  } catch (err) {
    return error(res, err.message)
  }
}

exports.getMyOrders = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query)
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id }, skip, take: limit,
        include: { items: { include: { menuItem: true } }, table: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where: { userId: req.user.id } })
    ])
    return paginated(res, orders, { total, page, limit })
  } catch (err) {
    return error(res, err.message)
  }
}

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { items: { include: { menuItem: true } }, table: true }
    })

    // Emit socket event cập nhật status realtime
    const io = req.app.get('io')
    io.emit('order_status_updated', { orderId: order.id, status: order.status, tableId: order.tableId })

    return success(res, order, 'Cập nhật trạng thái thành công')
  } catch (err) {
    return error(res, err.message)
  }
}
