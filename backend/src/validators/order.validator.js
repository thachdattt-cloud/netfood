const { z } = require('zod')

exports.createOrderSchema = z.object({
  tableId: z.number().int().positive('Số máy không hợp lệ'),
  note: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.number().int().positive(),
    quantity: z.number().int().positive('Số lượng phải lớn hơn 0'),
    note: z.string().optional()
  })).min(1, 'Đơn hàng phải có ít nhất 1 món')
})
