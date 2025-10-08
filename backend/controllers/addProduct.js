const Product = require('../models/productSchema'); // Adjust path as needed

const addProducts = async (req, res) => {
  try {
    const {
      title,
      category,
      price,
      size,
      colors,
      image,
      inStock,
      quantity
    } = req.body;

    // Extra: Simple validation to check presence of required fields
    if (
      !title ||
      !category ||
      price === undefined ||
      !size ||
      !colors ||
      !image ||
      inStock === undefined||
      !quantity
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create new product
    const newProduct = new Product({
      title,
      category,
      price,
      size,
      colors,
      image,
      inStock,
      quantity
    });

    // Save to DB
    const savedProduct = await newProduct.save();

    return res.status(201).json({
      message: "Product added successfully.",
      product: savedProduct,
    });
  } catch (error) {
    // Duplicate title or validation error
    if (error.code === 11000) {
      return res.status(409).json({ message: "Product with this title already exists." });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports =  addProducts ;
