const express = require('express')
const router = express.Router()
const { getAll, create, updateRole, remove } = require('../controllers/user.controller')
const { protect } = require('../middlewares/auth.middleware')
const { adminOnly } = require('../middlewares/role.middleware')

router.get('/', protect, adminOnly, getAll)
router.post('/', protect, adminOnly, create)
router.patch('/:id/role', protect, adminOnly, updateRole)
router.delete('/:id', protect, adminOnly, remove)

module.exports = router