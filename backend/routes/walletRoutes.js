const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getBalance, withdrawFunds } = require('../controllers/walletController');

router.get('/balance', verifyToken, getBalance);
router.post('/withdraw', verifyToken, withdrawFunds);
router.get('/withdrawals', verifyToken, getWithdrawals);

module.exports = router;
