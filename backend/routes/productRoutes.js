const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, getMyProducts } = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const verifyKYC = require('../middleware/verifyKYC');
const multer = require('multer');
const upload = multer();

router.post(
  '/',
  verifyToken,
  verifyKYC,
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'videoReel', maxCount: 1 }
  ]),
  createProduct
);

router.get('/', getAllProducts);                     // Public
router.get('/:id', getProductById);                  // Public
router.get('/my/listings', verifyToken, getMyProducts);  // Authenticated

module.exports = router;
