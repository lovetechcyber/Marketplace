const crypto = require('crypto');
const Transaction = require('../models/Transaction');

exports.paystackWebhook = async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET;
  const hash = crypto.createHmac('sha512', secret)
                     .update(req.body)
                     .digest('hex');

  const signature = req.headers['x-paystack-signature'];

  if (hash !== signature) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === 'charge.success') {
    const metadata = event.data.metadata;
    const transactionId = metadata.transactionId;

    const tx = await Transaction.findById(transactionId);
    if (tx) {
      tx.status = 'paid';
      await tx.save();
      console.log('Payment confirmed & escrow funded:', tx._id);
    }
  }

  res.sendStatus(200);
};
