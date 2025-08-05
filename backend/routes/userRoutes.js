const express = require('express');
const router = express.Router();
const { submitKYC } = require('../controllers/userController');
const multer = require('multer');
const upload = multer(); // handle multipart form

router.post('/kyc', upload.fields([
  { name: 'idImage', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), submitKYC);

module.exports = router;
