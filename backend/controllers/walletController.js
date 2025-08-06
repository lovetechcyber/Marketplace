const User = require('../models/User');
const axios = require('axios');

exports.getBalance = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ balance: user.walletBalance });
};

const Withdrawal = require('../models/Withdrawal');

exports.withdrawFunds = async (req, res) => {
  const { amount, bankCode, accountNumber } = req.body;

  const user = await User.findById(req.user.id);
  if (user.walletBalance < amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }

  const payout = await axios.post('https://api.flutterwave.com/v3/transfers', {
    account_bank: bankCode,
    account_number: accountNumber,
    amount,
    currency: 'NGN',
    narration: 'Marketplace Payout',
    reference: `payout_${Date.now()}`,
    beneficiary_name: user.fullName
  }, {
    headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
  });

  user.walletBalance -= amount;
  await user.save();

  await Withdrawal.create({
    sellerId: req.user.id,
    amount,
    method: 'flutterwave',
    transferId: payout.data.data.id
  });

  res.json({ message: 'Withdrawal successful' });
};

exports.getWithdrawals = async (req, res) => {
  const history = await Withdrawal.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
  res.json(history);
};
