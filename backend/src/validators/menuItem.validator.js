const { z } = require('zod')

exports.createMenuItemSchema = z.object({
  name: z.string().min(2, 'Tên món tối thiểu 2 ký tự'),
  description: z.string().optional(),
  price: z.number().positive('Giá phải lớn hơn 0'),
  categoryId: z.number().int().positive(),
  isAvailable: z.boolean().optional()
})
