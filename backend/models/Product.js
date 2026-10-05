const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: [{ type: String, required: true }],
    category: { type: String, required: true },
    subCategory: { type: String, default: '' },
    sizes: [{ type: String }],
    bestseller: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema)
