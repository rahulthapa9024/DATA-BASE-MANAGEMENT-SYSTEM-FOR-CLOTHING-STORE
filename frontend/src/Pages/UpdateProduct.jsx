import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function UpdateProduct() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    quantity: "",
    size: [],
    colors: [],
    image: [],
    inStock: false,
  });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 10; // Adjust as needed

  // Search term state for product title
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch products with pagination
  const fetchProducts = async (page = 1) => {
    setLoadingProducts(true);
    try {
      const { data } = await axiosClient.get(
        `/main/getProducts?page=${page}&limit=${productsPerPage}`
      );
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Set form with selected product details safely
  const fetchProductDetails = (product) => {
    setForm({
      title: product.title || "",
      category: product.category || "",
      price: product.price !== undefined ? product.price.toString() : "",
      quantity: product.quantity !== undefined ? product.quantity.toString() : "",
      size: Array.isArray(product.size) ? product.size : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      image: Array.isArray(product.image) ? product.image : [],
      inStock: product.inStock === true,
    });
    setSelectedImage(0);
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

  // When user selects a product, load its data into form
  useEffect(() => {
    if (selectedProductId) {
      const product = products.find((p) => p._id === selectedProductId);
      if (product) fetchProductDetails(product);
    } else {
      // Reset form if no product selected
      setForm({
        title: "",
        category: "",
        price: "",
        quantity: "",
        size: [],
        colors: [],
        image: [],
        inStock: false,
      });
      setSelectedImage(0);
    }
  }, [selectedProductId, products]);

  // Handle controlled inputs change
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "size" || name === "colors" || name === "image") {
      setForm((f) => ({
        ...f,
        [name]: value ? value.split(",").map((v) => v.trim()) : [],
      }));
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
    setSuccessMessage("");
    setError("");
  }

  // Toggle inStock status
  const toggleInStock = () => {
    setForm((f) => ({ ...f, inStock: !f.inStock }));
    setSuccessMessage("");
    setError("");
  };

  // Submit updated product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      setError("Please select a product to update.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be a positive number.");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccessMessage("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      const { data } = await axiosClient.patch(
        `/main/updateProducts/${selectedProductId}`,
        payload
      );
      if (data.product) {
        setSuccessMessage(data.message || "Product updated successfully!");
        // Refresh products list to get updated data
        fetchProducts(currentPage);
      } else {
        setError(data.message || "Failed to update product.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error during update.");
    }
    setUpdating(false);
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      fetchProducts(currentPage + 1);
      setSelectedProductId(""); // Clear selection when changing pages
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchProducts(currentPage - 1);
      setSelectedProductId(""); // Clear selection when changing pages
    }
  };

  const handlePageClick = (page) => {
    fetchProducts(page);
    setSelectedProductId(""); // Clear selection when changing pages
  };

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Filter products by search term in title, case insensitive
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Update Product
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Products Selection Side */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-cyan-400">
                  Select Product to Update
                </h2>
                <div className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages} • {totalProducts} total products
                </div>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading products...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <motion.div
                          key={product._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                            selectedProductId === product._id
                              ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                              : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                          }`}
                          onClick={() => setSelectedProductId(product._id)}
                        >
                          <div className="flex items-center gap-4">
                            {product.image && product.image[0] && (
                              <img
                                src={product.image[0]}
                                alt={product.title}
                                className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{product.title}</h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
                                <span>₹{product.price?.toFixed(2)}</span>
                                <span className="bg-gray-600 px-2 py-1 rounded-full text-xs">
                                  {product.category}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    product.inStock
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <span className="text-4xl mb-4 block">📦</span>
                        <p>No products found matching your search.</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-700/50">
                      <div className="text-sm text-gray-400">
                        Showing {filteredProducts.length} of {products.length} products on this page
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
                        >
                          Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {getPageNumbers().map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageClick(page)}
                              className={`w-10 h-10 rounded-lg border transition-all duration-300 ${
                                currentPage === page
                                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-400"
                                  : "border-gray-600 bg-gray-700/50 text-white hover:bg-gray-600/50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Selected Product Preview */}
            {selectedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
              >
                <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                  Current Product Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white">{selectedProduct.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-cyan-400">
                      ₹{selectedProduct.price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity:</span>
                    <span className="text-white">{selectedProduct.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-white capitalize">
                      {selectedProduct.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stock:</span>
                    <span
                      className={
                        selectedProduct.inStock ? "text-green-400" : "text-red-400"
                      }
                    >
                      {selectedProduct.inStock ? "Available" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Edit Form Side */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-semibold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {selectedProduct ? `Edit: ${selectedProduct.title}` : "Product Details"}
              </h2>

              {selectedProduct && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Images Preview */}
                  {form.image && form.image.length > 0 && (
                    <div className="space-y-4">
                      <label className="text-gray-300 font-medium block">
                        Product Images
                      </label>
                      <div className="space-y-4">
                        {/* Main Image */}
                        <div className="bg-gray-700/30 rounded-xl border border-gray-600 overflow-hidden">
                          <img
                            src={form.image[selectedImage]}
                            alt={form.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>

                        {/* Image Thumbnails */}
                        {form.image.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto py-2">
                            {form.image.map((url, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedImage(index)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all duration-300 ${
                                  selectedImage === index
                                    ? "border-cyan-400 shadow-lg shadow-cyan-500/20"
                                    : "border-gray-600 hover:border-gray-500"
                                }`}
                              >
                                <img
                                  src={url}
                                  alt={`${form.title} ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-300 font-medium block">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={form.title ?? ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-300 font-medium block">Category</label>
                      <select
                        name="category"
                        value={form.category ?? ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="" disabled>
                          Select Category
                        </option>
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-300 font-medium block">Price (₹)</label>
                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        value={form.price ?? ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-gray-300 font-medium block">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={form.quantity ?? ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 font-medium block">
                      Sizes{" "}
                      <span className="text-gray-400 text-sm">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="size"
                      placeholder="S, M, L, XL"
                      value={Array.isArray(form.size) ? form.size.join(", ") : ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 font-medium block">
                      Colors{" "}
                      <span className="text-gray-400 text-sm">(Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      name="colors"
                      placeholder="Red, Blue, Black"
                      value={Array.isArray(form.colors) ? form.colors.join(", ") : ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 font-medium block">
                      Image URLs{" "}
                      <span className="text-gray-400 text-sm">(Comma separated)</span>
                    </label>
                    <textarea
                      name="image"
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      value={Array.isArray(form.image) ? form.image.join(", ") : ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Toggle Button for inStock */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-600 bg-gray-900/30">
                    <div>
                      <label className="text-gray-300 font-medium block">Stock Status</label>
                      <p className="text-sm text-gray-400 mt-1">
                        {form.inStock
                          ? "Product is available for purchase"
                          : "Product is out of stock"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleInStock}
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${
                        form.inStock ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 ${
                          form.inStock ? "translate-x-9" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Stock Status Display */}
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl border ${
                      form.inStock
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${
                        form.inStock ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></span>
                    <span className="font-medium">
                      {form.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {updating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating Product...
                      </div>
                    ) : (
                      "Update Product"
                    )}
                  </button>
                </form>
              )}

              {!selectedProduct && (
                <div className="text-center py-12 text-gray-400">
                  <span className="text-6xl mb-4 block">📝</span>
                  <p className="text-lg">Select a product from the left to start editing</p>
                </div>
              )}
            </div>

            {/* Success/Error messages */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {successMessage}
                </motion.div>
              )}
              {error && (
                <motion.div
                  className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
