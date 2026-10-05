const express = require('express')
const { registerUser, loginUser, adminLogin, listUsers } = require('../controllers/userController')
const adminAuth = require('../middleware/adminAuth')

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/admin', adminLogin)
router.get('/list', adminAuth, listUsers)

module.exports = router
