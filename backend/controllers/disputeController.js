const { sendEmail } = require('../utils/sendEmail');

exports.openDispute = async (req, res) => {
  const tx = await Transaction.findById(req.params.id).populate('buyerId sellerId');
  if (!tx || tx.buyerId._id.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  tx.status = 'disputed';
  tx.disputed = true;
  tx.evidence = req.body.evidence || '';
  await tx.save();

  // Send email to admin
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'New Dispute Opened',
    html: `
      <h2>Dispute Alert</h2>
      <p><strong>Transaction:</strong> ${tx._id}</p>
      <p><strong>Buyer:</strong> ${tx.buyerId.fullName}</p>
      <p><strong>Seller:</strong> ${tx.sellerId.fullName}</p>
      <p><strong>Reason:</strong> ${req.body.reason || 'Not provided'}</p>
    `
  });

  res.json({ message: 'Dispute opened and admin alerted.' });
};
