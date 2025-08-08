const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getProductById, getMyProducts } = require('../controllers/productController');
const verifyToken = require('../middleware/verifyToken');
const verifyKYC = require('../middleware/verifyKYC');
const multer = require('multer');
const Product = require('../models/Product');
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

// Get recently viewed products by ID list
router.post('/recent', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Invalid product ID list' });
    }

    const products = await Product.find({
      _id: { $in: ids },
      status: 'approved'
    }).limit(6);

    res.json(products);
  } catch (err) {
    console.error('Error fetching recent products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
