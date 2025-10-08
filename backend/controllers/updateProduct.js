const Product = require('../models/productSchema'); // Adjust path as necessary

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // Get product ID from route params
    const updateData = req.body; // Product fields to update

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Perform the update
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product with this title already exists." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports =updateProduct ;
