const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const User = require('../models/User')

const { isConnected } = require('../config/db')

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      isAdmin: Boolean(user.isAdmin),
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  )

const sanitizeUser = (user) => ({
  _id: user._id || user.id,
  name: user.name,
  email: user.email,
  cartData: user.cartData || {},
  isAdmin: Boolean(user.isAdmin),
})

async function registerUser(req, res) {
  const { name, email, password } = req.body

  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again later.' })
  }

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All fields are required' })
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email' })
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' })
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      cartData: {},
      isAdmin: false,
    })

    const token = createToken(user)
    return res.json({ success: true, token, user: sanitizeUser(user.toObject()) })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body

  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again later.' })
  }

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' })
    }

    const token = createToken(user)
    return res.json({ success: true, token, user: sanitizeUser(user.toObject()) })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function adminLogin(req, res) {
  const { email, password } = req.body
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@forever.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  if (email.toLowerCase() !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' })
  }

  try {
    if (!isConnected()) {
      return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again later.' })
    }

    let adminUser = await User.findOne({ email: adminEmail })
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        cartData: {},
        isAdmin: true,
      })
    } else if (!adminUser.isAdmin) {
      adminUser.isAdmin = true
      await adminUser.save()
    }

    const token = createToken(adminUser)
    return res.json({ success: true, token, user: sanitizeUser(adminUser.toObject()) })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function listUsers(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Please try again later.' })
  }

  try {
    const users = await User.find({})
      .select('name email isAdmin createdAt')
      .sort({ createdAt: -1 })
      .lean()

    return res.json({ success: true, users })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { registerUser, loginUser, adminLogin, listUsers }
