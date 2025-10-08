import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

// --- START: Enhanced Stats Component ---
const ReturnStatsCard = ({ totalReturns, totalAmount, currentPageCount }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <span className="text-white text-xl">📦</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Total Returns</h3>
            <p className="text-orange-300 text-2xl font-bold">{totalReturns}</p>
            <p className="text-gray-400 text-sm">Overall count</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Filtered Refund Amount</h3>
            <p className="text-red-300 text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</p>
            <p className="text-gray-400 text-sm">{currentPageCount} items displayed</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-700/50 to-gray-600/50 border border-gray-500/30 rounded-2xl p-6 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-gray-300 font-bold text-lg">On Current Page</h3>
          <p className="text-white text-2xl font-bold">{currentPageCount} Records</p>
        </div>
      </div>
    </motion.div>
  );
};
// --- END: Enhanced Stats Component ---

export default function ReturnedProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReturns, setTotalReturns] = useState(0);
  // --- New state for search term ---
  const [searchTerm, setSearchTerm] = useState(""); 

  // Fetch returned products with pagination
  const fetchReturnedProducts = async (pageNum) => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get(`/main/getReturnProducts?page=${pageNum}&limit=30`);
      if (res.data.success) {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalReturns(res.data.totalReturns || res.data.products?.length || 0);
      } else {
        setError("Failed to fetch returned products");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching returned products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedProducts(page);
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  // --- Filter the products list based on the search term ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return products.filter(item => {
      const name = item.Name ? item.Name.toLowerCase() : '';
      const number = item.Number ? String(item.Number).toLowerCase() : '';
      
      // Check if the search term is included in either the Name or the Number
      return name.includes(lowerCaseSearch) || number.includes(lowerCaseSearch);
    });
  }, [products, searchTerm]);
  // -----------------------------------------------------------

  // Calculate total refund amount for current *filtered* page
  const totalRefundAmount = filteredProducts.reduce((sum, item) => {
    const price = Number(item.price ?? 0);
    const qty = Number(item.quantity ?? 0);
    return sum + price * qty;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 lg:p-6">
      <div className="max-w-[95rem] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          >
            Returned Products
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Track and manage all returned product records with detailed insights
          </motion.p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
            <input
                type="text"
                placeholder="Search by Customer Name or Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pl-12 rounded-2xl bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-300 text-lg shadow-lg shadow-gray-900/50"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                    aria-label="Clear search"
                >
                    &times;
                </button>
            )}
        </div>
        
        {/* Stats Overview */}
        {!loading && !error && (
          <ReturnStatsCard 
            totalReturns={totalReturns}
            totalAmount={totalRefundAmount}
            currentPageCount={filteredProducts.length}
          />
        )}
        
        {/* --- End of Search and Stats --- */}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-500 mx-auto mb-6"></div>
              <p className="text-gray-400 text-xl">Loading returned products...</p>
              <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
              <span className="text-5xl mb-4 block">⚠️</span>
              <h2 className="text-red-400 text-2xl mb-3">Error Loading Data</h2>
              <p className="text-gray-400 mb-6 text-lg">{error}</p>
              <button
                onClick={() => fetchReturnedProducts(page)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 text-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50">
                <span className="text-7xl mb-6 block">{searchTerm ? "🔎" : "📦"}</span>
                <h3 className="text-2xl font-bold text-gray-300 mb-3">
                    {searchTerm ? "No Matching Returns Found" : "No Returned Products"}
                </h3>
                <p className="text-gray-400 text-lg mb-6">
                    {searchTerm 
                        ? `Could not find any return matching "${searchTerm}" on this page.`
                        : "There are no returned product records to display at the moment."
                    }
                </p>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 px-6 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-orange-400 hover:bg-gray-600/50 transition-all duration-300 font-medium"
                    >
                        Clear Search
                    </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table Container */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden m-10 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-700/50 bg-gray-800/50">
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Image</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Customer Details</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Product Info</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Price</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Qty</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Size</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Color</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Category</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Return Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Use filteredProducts here */}
                    {filteredProducts.map((item, index) => (
                      <motion.tr 
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-all duration-300 group"
                      >
                        <td className="p-4 lg:p-6">
                          {Array.isArray(item.image) && item.image.length > 0 ? (
                            <img
                              src={item.image[0].trim()}
                              alt={item.title || "Product image"}
                              className="w-14 h-14 lg:w-16 lg:h-16 object-cover rounded-xl border border-gray-600/50 group-hover:border-orange-500/30 transition-colors duration-300"
                            />
                          ) : (
                            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-700/50 rounded-xl border border-gray-600/50 flex items-center justify-center group-hover:border-orange-500/30 transition-colors duration-300">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 lg:p-6">
                          <div>
                            <p className="font-medium text-white text-lg">{item.Name || "-"}</p>
                            <p className="text-gray-400 font-mono text-sm">{item.Number || "-"}</p>
                          </div>
                        </td>
                        <td className="p-4 lg:p-6">
                          <p className="font-medium text-white max-w-[200px] truncate" title={item.title}>
                            {item.title || "-"}
                          </p>
                          {item.description && (
                            <p className="text-gray-400 text-sm mt-1 max-w-[200px] truncate" title={item.description}>
                              {item.description}
                            </p>
                          )}
                        </td>
                        <td className="p-4 lg:p-6">
                          <span className="text-orange-400 font-bold text-lg">₹{item.price ?? "-"}</span>
                        </td>
                        <td className="p-4 lg:p-6">
                          <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/20">
                            {item.quantity ?? "-"}
                          </span>
                        </td>
                        <td className="p-4 lg:p-6">
                          {Array.isArray(item.size) ? (
                            <div className="flex flex-wrap gap-1 max-w-[120px]">
                              {item.size.map((size, i) => (
                                <span key={i} className="bg-gray-700/30 px-2 py-1 rounded text-xs border border-gray-600/50">
                                  {size}
                                </span>
                              ))}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-4 lg:p-6">
                          {Array.isArray(item.colors) ? (
                            <div className="flex flex-wrap gap-1 max-w-[120px]">
                              {item.colors.map((color, i) => (
                                <span key={i} className="bg-gray-700/30 px-2 py-1 rounded text-xs border border-gray-600/50">
                                  {color}
                                </span>
                              ))}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="p-4 lg:p-6">
                          <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm border border-red-500/20 capitalize">
                            {item.category || "-"}
                          </span>
                        </td>
                        <td className="p-4 lg:p-6">
                          <div className="text-sm">
                            <div className="text-red-400 font-medium text-base">
                              {item.date ? new Date(item.date).toLocaleDateString('en-IN') : "-"}
                            </div>
                            <div className="text-gray-400">
                              {item.date ? new Date(item.date).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ""}
                            </div>
                            <div className="text-orange-500 text-xs mt-1 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 inline-block">
                              Returned
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
                <div className="text-gray-400 text-sm">
                  Showing page {page} of {totalPages} • {products.length} total returned items
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrev}
                    disabled={page <= 1}
                    className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                      page <= 1
                        ? "bg-gray-700/30 border-gray-600 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50 hover:border-gray-500 transform hover:-translate-y-0.5"
                    }`}
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl border transition-all duration-300 ${
                            page === pageNum
                              ? "bg-gradient-to-r from-cyan-400 to-blue-500 border-cyan-400 text-white shadow-lg shadow-orange-500/25"
                              : "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && <span className="text-gray-400 px-2">...</span>}
                  </div>
                  <button
                    onClick={handleNext}
                    disabled={page >= totalPages}
                    className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2 ${
                      page >= totalPages
                        ? "bg-gray-700/30 border-gray-600 text-gray-500 cursor-not-allowed"
                        : "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50 hover:border-gray-500 transform hover:-translate-y-0.5"
                    }`}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Summary Footer */}
            {filteredProducts.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-6 text-center"
              >
                <p className="text-gray-300">
                  <span className="text-orange-400 font-bold">{filteredProducts.length}</span> records displayed • 
                  Filtered refund value: <span className="text-red-400 font-bold">₹{totalRefundAmount.toLocaleString('en-IN')}</span>
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}