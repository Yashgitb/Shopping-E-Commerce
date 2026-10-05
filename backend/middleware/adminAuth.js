const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret')

    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: 'Admin access required' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' })
  }
}
