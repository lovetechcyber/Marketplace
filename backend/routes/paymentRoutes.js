const express = require('express');
const router = express.Router();
const { paystackWebhook } = require('../controllers/paymentController');

router.post('/webhook', express.raw({ type: '*/*' }), paystackWebhook);

module.exports = router;
