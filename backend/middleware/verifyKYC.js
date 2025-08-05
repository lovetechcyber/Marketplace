const User = require('../models/User');

const verifyKYC = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.kyc.status !== 'approved') {
      return res.status(403).json({ error: 'KYC not verified' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = verifyKYC;
