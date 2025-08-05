const Product = require('../models/Product');
const { uploader } = require('../services/cloudinaryService');

exports.createProduct = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    const photoFiles = req.files.photos || [];
    const videoFile = req.files.videoReel?.[0];

    if (!title || !category || !price || photoFiles.length < 2) {
      return res.status(400).json({ error: 'Title, category, price, and at least 2 photos are required.' });
    }

    // Upload photos
    const photoUrls = [];
    for (const file of photoFiles) {
      const uploaded = await uploader.upload_stream_to_cloudinary(file.buffer, 'product_photos');
      photoUrls.push(uploaded.secure_url);
    }

    // Upload video reel if present
    let videoUrl = '';
    if (videoFile) {
      const uploadedVideo = await uploader.upload_stream_to_cloudinary(videoFile.buffer, 'product_videos');
      videoUrl = uploadedVideo.secure_url;
    }

    // Save product
    const newProduct = new Product({
      title,
      description,
      category,
      price,
      photos: photoUrls,
      videoReel: videoUrl,
      sellerId: req.user.id
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product posted successfully', product: newProduct });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post product' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    const query = {};

    if (category) {
      query.category = category.toLowerCase();
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      const keyword = new RegExp(search, 'i'); // case-insensitive regex
      query.$or = [
        { title: { $regex: keyword } },
        { description: { $regex: keyword } }
      ];
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .populate('sellerId', 'fullName');

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch products' });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('sellerId', 'fullName');

    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch product' });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch your products' });
  }
};


