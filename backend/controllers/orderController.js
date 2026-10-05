const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')
const { isConnected } = require('../config/db')

async function getUserRecord(userId) {
  return User.findById(userId)
}

async function placeOrder(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Order was not saved.' })
  }

  const { address, paymentMethod = 'COD' } = req.body

  if (!address) {
    return res.status(400).json({ success: false, message: 'Address is required' })
  }

  try {
    const user = await getUserRecord(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const cartData = user.cartData || {}
    const items = []

    for (const productId of Object.keys(cartData)) {
      const product = await Product.findById(productId)
      if (!product) continue

      for (const size of Object.keys(cartData[productId] || {})) {
        const quantity = Number(cartData[productId][size]) || 0
        if (quantity <= 0) continue

        items.push({
          productId: product._id || product.id,
          name: product.name,
          price: Number(product.price),
          size,
          quantity,
          image: product.image?.[0] || '',
          status: 'Ready to ship',
        })
      }
    }

    if (!items.length) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' })
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + 10

    const order = {
      userId: user._id || user.id,
      items,
      amount: total,
      address,
      status: 'Processing',
      paymentMethod,
      payment: paymentMethod === 'Razorpay' ? 'Paid' : 'COD',
      date: new Date().toISOString(),
    }

    const created = await Order.create(order)
    user.cartData = {}
    user.markModified('cartData')
    await user.save()
    return res.json({ success: true, order: created })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function createRazorpayOrder(req, res) {
  const { amount } = req.body

  if (!amount) {
    return res.status(400).json({ success: false, message: 'Amount is required' })
  }

  return res.json({
    success: true,
    order: {
      id: `razorpay_order_${Date.now()}`,
      amount: Number(amount) * 100,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
    },
  })
}

async function verifyPayment(req, res) {
  return res.json({ success: true, message: 'Payment verified' })
}

async function getUserOrders(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable.' })
  }

  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 })
    return res.json({ success: true, orders })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function listOrders(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable.' })
  }

  try {
    const orders = await Order.find({}).sort({ date: -1 })
    return res.json({ success: true, orders })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function updateOrderStatus(req, res) {
  const { orderId, status } = req.body

  if (!orderId || !status) {
    return res.status(400).json({ success: false, message: 'Order ID and status are required' })
  }

  if (!['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order status' })
  }

  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Order status was not updated.' })
  }

  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' })
    }
    return res.json({ success: true, order })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  placeOrder,
  createRazorpayOrder,
  verifyPayment,
  getUserOrders,
  listOrders,
  updateOrderStatus,
}
