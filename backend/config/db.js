const mongoose = require('mongoose')

async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn('MONGODB_URI is not configured. Running in demo mode without MongoDB.')
    return false
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB connected')
    return true
  } catch (error) {
    console.warn('MongoDB connection failed, continuing in demo mode:', error.message)
    return false
  }
}

function isConnected() {
  return mongoose.connection.readyState === 1
}

module.exports = { connectDB, isConnected }
