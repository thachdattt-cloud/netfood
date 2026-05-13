const express = require('express')
const router = express.Router()
const { createOrder, getOrders, getMyOrders, updateStatus } = require('../controllers/order.controller')
const { protect } = require('../middlewares/auth.middleware')
const { kitchenOrAdmin, staffOrAdmin } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { createOrderSchema } = require('../validators/order.validator')

router.post('/', validate(createOrderSchema), createOrder)           // Public (scan QR không cần login)
router.get('/', protect, kitchenOrAdmin, getOrders)                  // Kitchen + Admin
router.get('/my', protect, getMyOrders)                              // Customer đã login
router.patch('/:id/status', protect, staffOrAdmin, updateStatus)    // Staff + Admin

module.exports = router
