exports.success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data })
}
exports.error = (res, message = 'Error', statusCode = 500, errors = []) => {
  return res.status(statusCode).json({ success: false, message, errors })
}
exports.paginated = (res, data, pagination) => {
  return res.status(200).json({
    success: true, data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  })
}
