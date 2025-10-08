const Consumer = require('../models/comsumeProductSchema');
const Product = require("../models/productSchema");

const purchaseProduct = async (req, res) => {
  try {
    const {
      Name,
      Number,
      title,
      totalprice,
      quantity,
      size,
      color,
      category,
      image,
    } = req.body;

    // Basic input validation
    if (!Name || !Number || !title || !totalprice || !quantity || !size || !color || !category || !image) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Find the product
    const product = await Product.findOne({ title });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Only update quantity if it exists
    if (typeof product.quantity === "number") {
      if (product.quantity < quantity) {
        return res.status(400).json({ success: false, message: "Insufficient product stock" });
      }
      product.quantity -= quantity;
      await product.save();
    }

    // Prepare new purchase
    const newPurchase = new Consumer({
      Name,
      Number,
      title,
      price: totalprice,
      quantity,
      size: [size],      // store as array
      colors: [color],   // store as array
      category,
      image: Array.isArray(image) ? image : [image],
      date: new Date(),
    });

    await newPurchase.save();

    res.status(201).json({
      success: true,
      message: "Purchase saved successfully",
      purchase: newPurchase,
      remainingStock: product.quantity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = purchaseProduct;
