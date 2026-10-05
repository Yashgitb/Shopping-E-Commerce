const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express = require('express')
const cors = require('cors')
const { connectDB, isConnected } = require('./config/db')

const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')

const app = express()
const PORT = process.env.PORT || 4000
const databaseConnection = connectDB()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(async (req, res, next) => {
  try {
    await databaseConnection
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is up and running',
    databaseConnected: isConnected(),
  })
})

app.use('/api/user', userRoutes)
app.use('/api/product', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/order', orderRoutes)

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

if (process.env.VERCEL) {
  module.exports = app
} else {
  databaseConnection.finally(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
    })
  })
}
