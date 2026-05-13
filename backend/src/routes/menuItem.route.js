const express = require('express')
const router = express.Router()
const { getAll, getOne, create, update, remove } = require('../controllers/menuItem.controller')
const { protect } = require('../middlewares/auth.middleware')
const { adminOnly } = require('../middlewares/role.middleware')
const { validate } = require('../middlewares/validate.middleware')
const { createMenuItemSchema } = require('../validators/menuItem.validator')

router.get('/', getAll)
router.get('/:slug', getOne)
router.post('/', protect, adminOnly, validate(createMenuItemSchema), create)
router.put('/:id', protect, adminOnly, update)
router.delete('/:id', protect, adminOnly, remove)

module.exports = router
