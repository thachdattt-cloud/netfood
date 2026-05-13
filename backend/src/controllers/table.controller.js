const prisma = require('../config/db')
const { success, error } = require('../utils/response.util')

exports.getAll = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({ orderBy: { number: 'asc' } })
    return success(res, tables)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.create = async (req, res) => {
  try {
    const { number } = req.body
    const qrCode = `${process.env.CLIENT_URL}/menu?table=${number}`
    const table = await prisma.table.create({ data: { number, qrCode } })
    return success(res, table, 'Thêm máy thành công', 201)
  } catch (err) {
    return error(res, err.message)
  }
}

exports.remove = async (req, res) => {
  try {
    await prisma.table.delete({ where: { id: Number(req.params.id) } })
    return success(res, null, 'Xóa máy thành công')
  } catch (err) {
    return error(res, err.message)
  }
}
