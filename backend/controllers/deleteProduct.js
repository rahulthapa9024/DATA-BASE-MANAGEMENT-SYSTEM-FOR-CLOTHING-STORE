const Product = require("../models/productSchema");

// Express route handler
const deleteProductByTitleHandler = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const product = await Product.findOne({ title });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await Product.deleteOne({ title });

    return res.json({ success: true, message: "Product deleted successfully", deletedProduct: product });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ success: false, message: "Error deleting product", error: err.message });
  }
};

module.exports = deleteProductByTitleHandler;
