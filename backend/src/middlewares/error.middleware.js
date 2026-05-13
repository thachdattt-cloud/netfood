module.exports = (err, req, res, next) => {
  console.error(err.stack)
  if (err.code === 'P2002')
    return res.status(409).json({ success: false, message: `${err.meta?.target} đã tồn tại` })
  if (err.code === 'P2025')
    return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu' })
  res.status(err.statusCode || 500).json({ success: false, message: err.message || 'Lỗi server' })
}
