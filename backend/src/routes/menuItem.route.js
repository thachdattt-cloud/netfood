const express = require('express')
const router = express.Router()
const { getAll, getOne, search, create, update, remove, toggleAvailable, reportOutOfStock } = require('../controllers/menuItem.controller')
const { protect } = require('../middlewares/auth.middleware')
const { adminOnly, kitchenOrAdmin } = require('../middlewares/role.middleware')
const { upload } = require('../services/upload.service')

router.get('/', getAll)
router.get('/search', search)
router.get('/:slug', getOne)
router.post('/', protect, adminOnly, upload.single('image'), create)
router.put('/:id', protect, adminOnly, upload.single('image'), update)
router.delete('/:id', protect, adminOnly, remove)
router.patch('/:id/toggle', protect, adminOnly, toggleAvailable,kitchenOrAdmin)           // Admin toggle còn/hết hàng
router.post('/report-out-of-stock', protect, kitchenOrAdmin, reportOutOfStock) // Bếp báo hết hàng

module.exports = router