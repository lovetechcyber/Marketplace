const transactionSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  amount: Number,
  status: { type: String, enum: ['pending', 'paid', 'delivered', 'disputed', 'released'], default: 'pending' },
  deliveryConfirmed: { type: Boolean, default: false },
  escrowReleased: { type: Boolean, default: false },
  disputed: { type: Boolean, default: false },
  adminNote: { type: String, default: '' },
  evidence: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
