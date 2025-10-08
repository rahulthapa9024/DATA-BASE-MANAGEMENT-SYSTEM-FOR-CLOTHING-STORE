
const Return = require('../models/returnedSchema');

// GET /api/returnedProducts?page=1&limit=10
const getReturnProducts =  async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 50;
    const skip = (page - 1) * limit;

    const totalCount = await Return.countDocuments();

    const products = await Return.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      success: true,
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching returned products:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};

module.exports = getReturnProducts;
