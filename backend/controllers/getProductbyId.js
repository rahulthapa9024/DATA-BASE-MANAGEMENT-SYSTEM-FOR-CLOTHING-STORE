const Consumer = require('../models/productSchema'); // Adjust this path as needed

const getProductById = async (req, res) => {
  const { id } = req.params; // Use the ID from route params

  if (!id) {
    return res.status(400).json({ success: false, message: "Product ID is required" });
  }

  try {
    const product = await Consumer.findById(id); // Use dynamic id here
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = getProductById;
