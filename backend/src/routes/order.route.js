const express = require('express')
const router = express.Router()
const { createOrder, getOrders, getMyOrders, updateStatus, getDailyStats } = require('../controllers/order.controller')
const { protect } = require('../middlewares/auth.middleware')
const { kitchenOrAdmin, adminOnly } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { createOrderSchema } = require('../validators/order.validator')

router.post('/', validate(createOrderSchema), createOrder)
router.get('/', protect, kitchenOrAdmin, getOrders)
router.get('/my', protect, getMyOrders)
router.get('/stats/daily', protect, adminOnly, getDailyStats)
router.patch('/:id/status', protect, kitchenOrAdmin, updateStatus)

module.exports = router