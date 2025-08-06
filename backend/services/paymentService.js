const axios = require('axios');

exports.initiatePayment = async (req, res) => {
  const { productId, amount } = req.body;

  const product = await Product.findById(productId);
  const sellerId = product.sellerId;

  const transaction = await Transaction.create({
    buyerId: req.user.id,
    sellerId,
    productId,
    amount,
    status: 'pending'
  });

  const paystackRes = await axios.post('https://api.paystack.co/transaction/initialize', {
    email: req.user.email,
    amount: amount * 100,
    metadata: {
      transactionId: transaction._id
    }
  }, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`
    }
  });

  const { authorization_url } = paystackRes.data.data;

  res.json({ paymentUrl: authorization_url });
};
exports.confirmDelivery = async (req, res) => {
  const { id } = req.params;

  const transaction = await Transaction.findById(id);
  if (!transaction || transaction.buyerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed' });
  }

  transaction.deliveryConfirmed = true;
  transaction.status = 'delivered';

  await transaction.save();

  // release funds
  const seller = await User.findById(transaction.sellerId);
  seller.walletBalance += transaction.amount;
  await seller.save();

  transaction.escrowReleased = true;
  await transaction.save();

  res.json({ message: 'Delivery confirmed, escrow released' });
};
