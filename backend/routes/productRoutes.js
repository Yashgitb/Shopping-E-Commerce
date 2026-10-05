const express = require('express')
const { listProducts, getSingleProduct, addProduct, removeProduct } = require('../controllers/productController')
const adminAuth = require('../middleware/adminAuth')
const upload = require('../middleware/multer')

const router = express.Router()

router.get('/list', listProducts)
router.post('/single', getSingleProduct)
router.get('/single/:productId', getSingleProduct)
router.post('/add', adminAuth, upload.array('images', 4), addProduct)
router.post('/remove', adminAuth, removeProduct)

module.exports = router
