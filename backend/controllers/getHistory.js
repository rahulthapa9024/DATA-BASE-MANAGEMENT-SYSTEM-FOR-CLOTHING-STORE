const Consumer = require('../models/comsumeProductSchema'); // Adjust path if needed

const getAllConsumers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // default to page 1 if not provided
    const limit = 50; // max 30 products per page
    const skip = (page - 1) * limit;

    // fetch consumers with pagination, sorted by date descending
    const consumers = await Consumer.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // optionally, you can send total count for frontend paging controls
    const totalCount = await Consumer.countDocuments();

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      consumers,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = getAllConsumers;
