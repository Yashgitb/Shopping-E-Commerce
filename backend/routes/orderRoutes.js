const express = require('express')
const { placeOrder, createRazorpayOrder, verifyPayment, getUserOrders, listOrders, updateOrderStatus } = require('../controllers/orderController')
const auth = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')

const router = express.Router()

router.post('/place', auth, placeOrder)
router.post('/razorpay', auth, createRazorpayOrder)
router.post('/verify', auth, verifyPayment)
router.get('/userorders', auth, getUserOrders)
router.post('/list', adminAuth, listOrders)
router.post('/status', adminAuth, updateOrderStatus)

module.exports = router
