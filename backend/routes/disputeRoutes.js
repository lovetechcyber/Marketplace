const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authMiddleware } = require('../middleware/auth');

// POST /api/transactions/dispute
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { txnId, reason, evidenceUrl } = req.body;

    const txn = await Transaction.findOne({ _id: txnId, buyerId: req.user.id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    if (txn.dispute?.opened) return res.status(400).json({ message: 'Dispute already opened' });

    txn.dispute = {
      opened: true,
      reason,
      evidenceUrl,
      createdAt: new Date()
    };
    txn.status = 'disputed';

    await txn.save();

    // Optional: send admin email notification here

    res.json({ message: 'Dispute submitted successfully' });
  } catch (err) {
    console.error('Dispute Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


router.patch(
  '/:id/dispute',
  verifyToken,
  upload.single('evidence'),
  openDispute
);
