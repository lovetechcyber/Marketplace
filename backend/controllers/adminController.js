const Transaction = require('../models/Transaction');
const User = require('../models/User');

exports.listDisputes = async (req, res) => {
  const disputes = await Transaction.find({ disputed: true });
  res.json(disputes);
};

exports.resolveDispute = async (req, res) => {
  const { id } = req.params;
  const { outcome, adminNote } = req.body;

  const tx = await Transaction.findById(id);
  if (!tx || !tx.disputed) return res.status(404).json({ error: 'Dispute not found' });

  if (outcome === 'refund') {
    tx.status = 'refunded';
    tx.escrowReleased = true;
    tx.adminNote = adminNote;
    await tx.save();
    return res.json({ message: 'Refund issued to buyer' });
  }

  if (outcome === 'release') {
    const seller = await User.findById(tx.sellerId);
    seller.walletBalance += tx.amount;
    await seller.save();

    tx.status = 'released';
    tx.escrowReleased = true;
    tx.adminNote = adminNote;
    await tx.save();
    return res.json({ message: 'Escrow released to seller' });
  }

  res.status(400).json({ error: 'Invalid outcome' });
};

exports.markAsReleased = async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx || tx.escrowReleased) return res.status(404).json({ error: 'Invalid or already released' });

  const seller = await User.findById(tx.sellerId);
  seller.walletBalance += tx.amount;
  await seller.save();

  tx.status = 'released';
  tx.escrowReleased = true;
  await tx.save();

  res.json({ message: 'Funds released manually to seller' });
};
exports.getKYCRequests = async (req, res) => {
  const pending = await User.find({ kycStatus: 'pending' });
  res.json(pending);
};

exports.approveKYC = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { kycStatus: 'approved' });
  res.json({ message: 'KYC approved' });
};

exports.rejectKYC = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { kycStatus: 'rejected' });
  res.json({ message: 'KYC rejected' });
};
exports.getLiveUsers = async (req, res) => {
  const liveUsers = await User.find({ isLive: true }).populate('liveProductId');
  res.json(liveUsers);
};

exports.toggleLiveStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isLive = !user.isLive;
  await user.save();

  res.json({ message: `User ${user.isLive ? 'activated' : 'deactivated'} for live selling` });
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findByIdAndUpdate(id, updates, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ message: 'User deleted successfully' });
};

exports.getUserWalletBalance = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ walletBalance: user.walletBalance });
};

const { logAdminAction } = require('../utils/logAdminAction');

exports.banUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isBanned: true });
  await logAdminAction({
    adminId: req.user.id,
    action: 'Ban User',
    targetId: req.params.id,
    targetType: 'User',
    details: 'User banned by admin'
  });
  res.json({ message: 'User banned' });
};
