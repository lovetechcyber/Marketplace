const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const verifyKYC = require('../middleware/verifyKYC');
const { goLive, stopLive, getLiveStatus } = require('../controllers/liveController');

router.post('/start', verifyToken, verifyKYC, goLive);
router.post('/stop', verifyToken, stopLive);
router.get('/status', verifyToken, getLiveStatus);

module.exports = router;
