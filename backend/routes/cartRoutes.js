const express = require('express')
const { addToCart, updateCart, getCart } = require('../controllers/cartController')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/add', auth, addToCart)
router.post('/update', auth, updateCart)
router.post('/get', auth, getCart)

module.exports = router
