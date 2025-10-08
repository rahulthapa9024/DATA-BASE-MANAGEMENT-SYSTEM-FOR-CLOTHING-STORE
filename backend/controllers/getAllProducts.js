const Product = require('../models/productSchema'); // Adjust path if needed

const getAllProducts = async (req, res) => {
  const limit = 50;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      products,
      page,
      totalPages,
      message: "Products fetched successfully with pagination",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

module.exports = getAllProducts;
