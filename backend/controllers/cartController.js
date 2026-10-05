const User = require('../models/User')
const Product = require('../models/Product')
const { isConnected } = require('../config/db')

const demoUsers = global.__demoUsers || (global.__demoUsers = [])

async function getUserRecord(userId) {
  if (isConnected()) {
    return User.findById(userId)
  }

  return demoUsers.find((user) => user._id === userId || user.id === userId) || null
}

async function addToCart(req, res) {
  const { productId, size, quantity = 1 } = req.body

  if (!productId || !size) {
    return res.status(400).json({ success: false, message: 'Product ID and size are required' })
  }

  try {
    if (isConnected()) {
      const user = await getUserRecord(req.user.id)
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      const nextQty = Number(quantity) || 1
      user.cartData = user.cartData || {}
      user.cartData[productId] = user.cartData[productId] || {}
      user.cartData[productId][size] = (Number(user.cartData[productId][size]) || 0) + nextQty
      user.markModified('cartData')
      await user.save()
      return res.json({ success: true, cartData: user.cartData })
    }

    const user = await getUserRecord(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.cartData = user.cartData || {}
    user.cartData[productId] = user.cartData[productId] || {}
    user.cartData[productId][size] = (Number(user.cartData[productId][size]) || 0) + Number(quantity || 1)
  
    return res.json({ success: true, cartData: user.cartData })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function updateCart(req, res) {
  const { productId, size, quantity } = req.body

  if (!productId || !size || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Product ID, size and quantity are required' })
  }

  try {
    if (isConnected()) {
      const user = await getUserRecord(req.user.id)
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      user.cartData = user.cartData || {}
      user.cartData[productId] = user.cartData[productId] || {}
      user.cartData[productId][size] = Number(quantity)
      user.markModified('cartData')
      await user.save()
      return res.json({ success: true, cartData: user.cartData })
    }

    const user = await getUserRecord(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    user.cartData = user.cartData || {}
    user.cartData[productId] = user.cartData[productId] || {}
    user.cartData[productId][size] = Number(quantity)
    return res.json({ success: true, cartData: user.cartData })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function getCart(req, res) {
  try {
    if (isConnected()) {
      const user = await getUserRecord(req.user.id)
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' })
      }

      return res.json({ success: true, cartData: user.cartData || {} })
    }

    const user = await getUserRecord(req.user.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    return res.json({ success: true, cartData: user.cartData || {} })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { addToCart, updateCart, getCart }
