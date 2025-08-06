const withdrawalSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  transferId: String,
  method: String,
  status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
adminNote: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
