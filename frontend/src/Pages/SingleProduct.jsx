import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";

export default function SingleProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const [form, setForm] = useState({
    Name: "",
    Number: "",
    quantity: 1,
    size: "",
    color: "",
    finalPrice: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const { data } = await axiosClient.get(`/main/getProductById/${id}`);
        if (data.success) {
          setProduct(data.product);
          setForm((f) => ({
            ...f,
            size: data.product.size?.[0] || "",
            color: data.product.colors?.[0] || "",
            finalPrice: "",
          }));
        } else {
          setError(data.message || "Failed to fetch product.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching product.");
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setPurchaseError("");
    setPurchaseSuccess("");
  }

  async function handlePurchase(e) {
    e.preventDefault();

    if (!form.Name || !form.Number || !form.quantity || !form.size || !form.color) {
      setPurchaseError("Please fill all fields and select size and color.");
      setPurchaseSuccess("");
      return;
    }

    setPurchaseLoading(true);
    setPurchaseError("");
    setPurchaseSuccess("");

    try {
      let priceToUse = Number(form.finalPrice);
      if (isNaN(priceToUse) || priceToUse <= 0) priceToUse = product.price;

      const totalprice = priceToUse * Number(form.quantity);

      const payload = {
        Name: form.Name,
        Number: form.Number,
        title: product.title,
        totalprice,
        quantity: Number(form.quantity),
        size: form.size,
        color: form.color,
        category: product.category,
        image: product.image,
      };

      const { data } = await axiosClient.post("/main/purchaseProduct", payload);

      if (data.success) {
        setPurchaseSuccess(data.message || "Purchase successful!");
        setForm({
          Name: "",
          Number: "",
          quantity: 1,
          size: product.size?.[0] || "",
          color: product.colors?.[0] || "",
          finalPrice: "",
        });
      } else {
        setPurchaseError(data.message || "Purchase failed.");
      }
    } catch (err) {
      setPurchaseError(err.response?.data?.message || "Server error during purchase.");
    }

    setPurchaseLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading product details...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-red-400 text-xl mb-2">Error Loading Product</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🔍</span>
          <h2 className="text-gray-300 text-xl mb-2">Product Not Found</h2>
          <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
          >
            Browse Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 mb-6 group"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform duration-300">←</span>
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden cursor-zoom-in"
              onClick={() => setShowImageModal(true)}
            >
              {product.image?.[selectedImage] && (
                <img
                  src={product.image[selectedImage]}
                  alt={product.title}
                  className="w-full h-96 object-cover transition-transform duration-500 hover:scale-105"
                />
              )}
            </div>

            {/* Image Thumbnails */}
            {product.image && product.image.length > 1 && (
              <div className="flex gap-3 overflow-x-auto py-2">
                {product.image.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                      selectedImage === index 
                        ? "border-cyan-400 shadow-lg shadow-cyan-500/20" 
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {product.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  ₹{product.price.toFixed(2)}
                </span>
                <span className="bg-gray-700/50 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📦</span>
                <span>Quantity: {product.quantity ?? "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🏷️</span>
                <span>Category: {product.category}</span>
              </div>
              {Array.isArray(product.size) && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📏</span>
                  <span>Sizes: {product.size.join(", ")}</span>
                </div>
              )}
              {Array.isArray(product.colors) && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">🎨</span>
                  <span>Colors: {product.colors.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              product.inStock 
                ? "bg-green-500/10 border-green-500/30 text-green-400" 
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              <span className={`w-3 h-3 rounded-full ${
                product.inStock ? "bg-green-400" : "bg-red-400"
              }`}></span>
              <span className="font-medium">
                {product.inStock ? "In Stock - Ready to Ship" : "Out of Stock"}
              </span>
            </div>

            {/* Purchase Form */}
            <form onSubmit={handlePurchase} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 space-y-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Purchase Details
              </h2>

              {/* Name & Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-300 font-medium block">Full Name</label>
                  <input
                    type="text"
                    name="Name"
                    value={form.Name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 font-medium block">Phone Number</label>
                  <input
                    type="tel"
                    name="Number"
                    value={form.Number}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your number"
                    required
                  />
                </div>
              </div>

              {/* Quantity & Final Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-300 font-medium block">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max={product.quantity || 10}
                    value={form.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 font-medium block">
                    Final Price <span className="text-gray-500 text-sm">(optional)</span>
                  </label>
                  <input
                    type="number"
                    name="finalPrice"
                    min="0"
                    step="0.01"
                    placeholder={`Default: ₹${product.price.toFixed(2)}`}
                    value={form.finalPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <label className="text-gray-300 font-medium block">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.size.map((size) => (
                    <label key={size} className="cursor-pointer">
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={form.size === size}
                        onChange={handleChange}
                        className="hidden"
                        required
                      />
                      <span className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        form.size === size
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/10"
                          : "bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white"
                      }`}>
                        {size}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <label className="text-gray-300 font-medium block">Select Color</label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={`w-12 h-12 rounded-full border-3 transition-all duration-300 shadow-lg ${
                        form.color === color 
                          ? "border-white shadow-white/20 scale-110" 
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Messages */}
              {purchaseError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
                  {purchaseError}
                </div>
              )}
              {purchaseSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl">
                  {purchaseSuccess}
                </div>
              )}

              {/* Purchase Button */}
              <button
                type="submit"
                disabled={purchaseLoading || !product.inStock}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                  product.inStock
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-0.5"
                    : "bg-gray-600 cursor-not-allowed text-gray-400"
                } ${purchaseLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {purchaseLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Purchase...
                  </div>
                ) : product.inStock ? (
                  "Complete Purchase"
                ) : (
                  "Out of Stock"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && product.image?.[selectedImage] && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={product.image[selectedImage]}
              alt={product.title}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}