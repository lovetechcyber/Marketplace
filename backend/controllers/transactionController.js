exports.openDispute = async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx || tx.buyerId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  tx.status = 'disputed';
  tx.disputed = true;
  await tx.save();

  res.json({ message: 'Dispute opened. Admin will review.' });
};
