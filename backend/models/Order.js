const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String, default: '' },
        quantity: { type: Number, required: true },
        image: { type: String, default: '' },
        status: { type: String, default: 'Ready to ship' },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: 'Processing' },
    paymentMethod: { type: String, required: true },
    payment: { type: String, default: 'COD' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema)
