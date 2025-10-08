import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router-dom";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [searchTitle, setSearchTitle] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minPrice] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const { data } = await axiosClient.get(`/main/getProducts?page=${page}`);
        if (data.success) {
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
          // Reset maxPrice when page changes and new data fetched
          const highestPrice = data.products.reduce((max, p) => (p.price > max ? p.price : max), 0);
          setMaxPrice(highestPrice || 5000);
        } else {
          setError(data.message || "Failed to fetch products.");
          setProducts([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching products.");
        setProducts([]);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [page]);

  const maxProductPrice = products.reduce(
    (max, p) => (p.price > max ? p.price : max),
    0
  );

  const categories = ["all", ...new Set(products.map(p => p.category).filter(Boolean))];
  const sizes = ["all", ...new Set(products.flatMap(p => Array.isArray(p.size) ? p.size : []).filter(Boolean))];
  const colors = ["all", ...new Set(products.flatMap(p => Array.isArray(p.colors) ? p.colors : []).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesTitle = product.title.toLowerCase().includes(searchTitle.toLowerCase());
    const price = Number(product.price);
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSize = selectedSize === "all" || (Array.isArray(product.size) && product.size.includes(selectedSize));
    const matchesColor = selectedColor === "all" || (Array.isArray(product.colors) && product.colors.includes(selectedColor));

    return matchesTitle && matchesPrice && matchesCategory && matchesSize && matchesColor;
  });

  const resetFilters = () => {
    setSearchTitle("");
    setMaxPrice(maxProductPrice || 5000);
    setSelectedCategory("all");
    setSelectedSize("all");
    setSelectedColor("all");
  };

  // Pagination handlers
  const handlePrev = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
            All Products
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our complete collection of premium products
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchTitle}
                onChange={e => setSearchTitle(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white w-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:from-cyan-500/30 hover:to-blue-500/30"
            >
              <span>🎛️</span>
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            {/* Price Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300 font-medium">Price Range</label>
                <span className="text-cyan-400 font-semibold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={minPrice}
                max={maxProductPrice || 5000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-400 [&::-webkit-slider-thumb]:to-blue-500"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>₹{minPrice}</span>
                <span>₹{maxProductPrice || 5000}</span>
              </div>
            </div>

            {/* Category / Size / Color Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-gray-300 font-medium block">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 font-medium block">Size</label>
                <select
                  value={selectedSize}
                  onChange={e => setSelectedSize(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                >
                  {sizes.map(size => (
                    <option key={size} value={size}>
                      {size === "all" ? "All Sizes" : size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 font-medium block">Color</label>
                <select
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                >
                  {colors.map(color => (
                    <option key={color} value={color}>
                      {color === "all" ? "All Colors" : color}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-400 font-medium hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <span>🔄</span>
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count and Pagination */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <p className="text-gray-400">
            Showing {filteredProducts.length} of {products.length} products (Page {page} of {totalPages})
          </p>
          <div className="space-x-4">
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                page <= 1
                  ? "bg-gray-700/30 border-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50 hover:border-gray-500 transform hover:-translate-y-0.5"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages}
              className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                page >= totalPages
                  ? "bg-gray-700/30 border-gray-600 text-gray-500 cursor-not-allowed"
                  : "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50 hover:border-gray-500 transform hover:-translate-y-0.5"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6 max-w-md mx-auto">
              <span className="text-4xl mb-4 block">⚠️</span>
              <p className="text-red-400 text-lg mb-2">Error Loading Products</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-2xl p-8 max-w-md mx-auto">
              <span className="text-4xl mb-4 block">🔍</span>
              <p className="text-gray-300 text-lg mb-2">No products found</p>
              <p className="text-gray-400 text-sm mb-4">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product._id}
                className={`group relative bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 ${
                  product.inStock ? "cursor-pointer transform hover:-translate-y-2" : "opacity-60 cursor-not-allowed"
                }`}
                onClick={() => product.inStock && navigate(`/singlePage/${product._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && product.inStock && navigate(`/singlePage/${product._id}`)}
              >
                {/* Product Images */}
                {Array.isArray(product.image) && product.image.length > 0 && (
                  <div className="mb-4 relative overflow-hidden rounded-xl">
                    <img
                      src={product.image[0]}
                      alt={product.title}
                      className={`w-full h-48 object-cover rounded-xl group-hover:scale-110 transition-transform duration-500 ${
                        !product.inStock ? "grayscale" : ""
                      }`}
                      loading="lazy"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                        <span className="text-red-500 font-bold text-lg">Not Available</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Product Info */}
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2">
                    {product.title}
                  </h2>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-cyan-400">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <span>📦</span>
                      <span>Qty: {product.quantity ?? "N/A"}</span>
                    </div>
                    {Array.isArray(product.size) && product.size.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span>📏</span>
                        <span className="truncate">{product.size.slice(0, 2).join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(product.colors) && product.colors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Colors:</span>
                      <div className="flex gap-1 flex-wrap">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <span
                            key={index}
                            className="text-xs bg-gray-700/50 px-2 py-1 rounded-full text-gray-300"
                          >
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-cyan-400">
                            +{product.colors.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
