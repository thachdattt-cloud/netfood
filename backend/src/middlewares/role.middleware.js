exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN')
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' })
  next()
}

exports.kitchenOrAdmin = (req, res, next) => {
  if (!['ADMIN', 'KITCHEN', 'STAFF'].includes(req.user?.role))
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' })
  next()
}

exports.staffOrAdmin = (req, res, next) => {
  if (!['ADMIN', 'STAFF'].includes(req.user?.role))
    return res.status(403).json({ success: false, message: 'Không có quyền truy cập' })
  next()
}
