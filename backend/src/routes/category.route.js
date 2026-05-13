const express = require('express')
const router = express.Router()
const { getAll, create, remove } = require('../controllers/category.controller')
const { protect } = require('../middlewares/auth.middleware')
const { adminOnly } = require('../middlewares/role.middleware')

router.get('/', getAll)
router.post('/', protect, adminOnly, create)
router.delete('/:id', protect, adminOnly, remove)

module.exports = router
