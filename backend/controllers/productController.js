const Product = require('../models/Product')
const { isConnected } = require('../config/db')

const demoProducts = global.__demoProducts || (global.__demoProducts = [
  {
    _id: 'p1',
    name: 'Classic White Tee',
    description: 'A soft cotton staple for everyday wear.',
    price: 29,
    image: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'],
    category: 'Men',
    subCategory: 'T-Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    bestseller: true,
    date: new Date().toISOString(),
  },
  {
    _id: 'p2',
    name: 'Urban Denim Jacket',
    description: 'A versatile outer layer built for cooler days.',
    price: 89,
    image: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'],
    category: 'Women',
    subCategory: 'Jackets',
    sizes: ['S', 'M', 'L'],
    bestseller: true,
    date: new Date().toISOString(),
  },
  {
    _id: 'p3',
    name: 'Minimal Leather Bag',
    description: 'Structured design and premium finish.',
    price: 120,
    image: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80'],
    category: 'Accessories',
    subCategory: 'Bags',
    sizes: ['One Size'],
    bestseller: false,
    date: new Date().toISOString(),
  },
  {
    _id: 'p4',
    name: 'Performance Sneakers',
    description: 'All-day comfort with a lightweight sole.',
    price: 99,
    image: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
    category: 'Men',
    subCategory: 'Shoes',
    sizes: ['7', '8', '9', '10'],
    bestseller: true,
    date: new Date().toISOString(),
  },
])

const normalizeSizes = (value) => {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : parsed.split(',').map((item) => item.trim()).filter(Boolean)
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

const normalizeImages = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean)
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }
  return []
}

async function listProducts(req, res) {
  try {
    if (isConnected()) {
      const products = await Product.find({}).sort({ date: -1 })
      return res.json({ success: true, products })
    }

    return res.json({ success: true, products: demoProducts })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function getSingleProduct(req, res) {
  const productId = req.body.productId || req.params.productId || req.query.productId || req.query.id

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' })
  }

  try {
    if (isConnected()) {
      const product = await Product.findById(productId)
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
      }
      return res.json({ success: true, product })
    }

    const product = demoProducts.find((item) => item._id === productId)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    return res.json({ success: true, product })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function addProduct(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Product was not saved.' })
  }

  const payload = req.body || {}
  const files = req.files || []

  const uploadBytes = files.reduce((total, file) => total + file.size, 0)
  if (uploadBytes > 10 * 1024 * 1024) {
    return res.status(413).json({ success: false, message: 'The combined image size must not exceed 10 MB' })
  }

  const bodyImages = normalizeImages(payload.image || payload.images)
  const uploadedImages = files.length ? files.map((file) => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`) : bodyImages

  const productData = {
    name: payload.name,
    description: payload.description || 'No description provided',
    price: Number(payload.price),
    category: payload.category,
    subCategory: payload.subCategory || '',
    sizes: normalizeSizes(payload.sizes),
    bestseller: payload.bestseller === true || payload.bestseller === 'true',
    image: uploadedImages.length ? uploadedImages : ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80'],
  }

  if (
    typeof productData.name !== 'string' ||
    !productData.name.trim() ||
    typeof productData.category !== 'string' ||
    !productData.category.trim() ||
    !Number.isFinite(productData.price) ||
    productData.price <= 0 ||
    !Number.isInteger(productData.quantity) ||
    productData.quantity < 0
  ) {
    return res.status(400).json({ success: false, message: 'A name, category, positive price and non-negative whole-number quantity are required' })
  }

  try {
    const product = await Product.create(productData)
    return res.json({ success: true, product })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

async function removeProduct(req, res) {
  if (!isConnected()) {
    return res.status(503).json({ success: false, message: 'Database is unavailable. Product was not removed.' })
  }

  const productId = req.body.productId || req.params.productId

  if (!productId) {
    return res.status(400).json({ success: false, message: 'Product ID is required' })
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId)
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    return res.json({ success: true, message: 'Product removed' })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { listProducts, getSingleProduct, addProduct, removeProduct }
