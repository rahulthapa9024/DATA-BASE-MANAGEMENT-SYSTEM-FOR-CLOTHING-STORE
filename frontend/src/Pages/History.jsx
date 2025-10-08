import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "../../src/utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

// --- START: Full-Page Confirmation Modal Component ---
const ConfirmReturnModal = ({ consumer, onConfirm, onCancel }) => {
  if (!consumer) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl w-full max-w-lg border border-red-500/30"
      >
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
          Confirm Product Return
        </h2>
        <p className="mb-6 text-gray-300 text-lg">
          Are you absolutely sure you want to process the return for this purchase?
        </p>

        <div className="bg-gray-700/50 p-6 rounded-xl mb-6 border border-gray-600/50">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">📦</span>
              <span className="text-white font-medium">{consumer.title || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">👤</span>
              <span className="text-white">{consumer.Name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">📞</span>
              <span className="text-white">{consumer.Number || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">🔢</span>
              <span className="text-white">Quantity: {consumer.quantity ?? 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">💰</span>
              <span className="text-cyan-400 font-semibold">₹{consumer.price ?? 'N/A'}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm text-center">
              ⚠️ This action will mark the item as returned and update inventory
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-gray-600/50 text-gray-300 border border-gray-500/30 hover:bg-gray-500/50 hover:text-white transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(consumer._id)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-600 hover:to-orange-600 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Yes, Process Return
          </button>
        </div>
      </motion.div>
    </div>
  );
};
// --- END: Full-Page Confirmation Modal Component ---

// --- START: Enhanced Total Amount Component (Removed mb-6) ---
const TotalAmountCard = ({ amount, itemCount }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // REMOVED mb-6 here for better parent spacing control
      className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10">
        <div className="flex items-center gap-4 mb-4 lg:mb-0">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Total Revenue</h3>
            <p className="text-cyan-300 text-sm">{itemCount} {itemCount === 1 ? 'item' : 'items'} displayed</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-gray-300 text-sm font-medium">INR</span>
            <span className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">Current page total (Filtered)</p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
    </motion.div>
  );
};
// --- END: Enhanced Total Amount Component ---

export default function AllConsumersPage() {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [returningId, setReturningId] = useState(null);
  const [consumerToConfirm, setConsumerToConfirm] = useState(null);
  // --- New state for search term ---
  const [searchTerm, setSearchTerm] = useState(""); 

  useEffect(() => {
    // The page dependency correctly handles fetching new pages
    fetchConsumers(page);
  }, [page]);

  const fetchConsumers = async (pageNum) => {
    setLoading(true);
    setError("");
    try {
      // NOTE: For true scalability, the search term should be passed to the backend:
      // const res = await axiosClient.get(`/main/getHistory?page=${pageNum}&search=${searchTerm}`);
      const res = await axiosClient.get(`/main/getHistory?page=${pageNum}`);
      if (res.data.success && Array.isArray(res.data.consumers)) {
        setConsumers(res.data.consumers);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError("Failed to fetch data");
        setConsumers([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching data");
      setConsumers([]);
    } finally {
      setLoading(false);
    }
  };

  const startReturnConfirmation = (consumer) => {
    setConsumerToConfirm(consumer);
  };

  const handleReturn = async (consumerId) => {
    setConsumerToConfirm(null);
    setReturningId(consumerId);
    try {
      const res = await axiosClient.post("/main/productReturned", { consumerId });
      if (res.data.success) {
        alert("Return recorded successfully.");
        // Refetch to update the list
        fetchConsumers(page);
      } else {
        alert(res.data.message || "Failed to record return.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error processing return.");
    }
    setReturningId(null);
  };

  const handleCancelConfirmation = () => {
    setConsumerToConfirm(null);
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  // --- Filter the consumers list based on the search term ---
  const filteredConsumers = useMemo(() => {
    if (!searchTerm) {
      return consumers;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();

    return consumers.filter(consumer => {
      const name = consumer.Name ? consumer.Name.toLowerCase() : '';
      const number = consumer.Number ? String(consumer.Number).toLowerCase() : '';
      
      // Check if the search term is included in either the Name or the Number
      return name.includes(lowerCaseSearch) || number.includes(lowerCaseSearch);
    });
  }, [consumers, searchTerm]);
  // -----------------------------------------------------------

  // --- Calculate total amount for the *filtered* list ---
  const totalAmount = filteredConsumers.reduce((sum, item) => {
    const price = Number(item.price ?? 0);
    const qty = Number(item.quantity ?? 0);
    return sum + price * qty;
  }, 0);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 lg:p-6">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {consumerToConfirm && (
          <ConfirmReturnModal
            consumer={consumerToConfirm}
            onConfirm={handleReturn}
            onCancel={handleCancelConfirmation}
          />
        )}
      </AnimatePresence>

      <div className="max-w-[95rem] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            All Purchases
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Manage customer purchases, track revenue, and process returns efficiently
          </p>
        </div>

        {/* --- START: Revised Layout for Search and Stats --- */}
        <div className="mb-6">
            {/* Stats Overview: Full Width */}
            {!loading && !error && (
                <div className="mb-6">
                    <TotalAmountCard 
                        amount={totalAmount} 
                        itemCount={filteredConsumers.length} 
                    />
                </div>
            )}
            
            {/* Search Bar: Full Width */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by Customer Name or Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 pl-12 rounded-2xl bg-gray-800/80 border border-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 text-lg shadow-lg shadow-gray-900/50"
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
        </div>
        {/* --- END: Revised Layout for Search and Stats --- */}


        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-cyan-500 mx-auto mb-6"></div>
              <p className="text-gray-400 text-xl">Loading purchases...</p>
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
                onClick={() => fetchConsumers(page)}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 text-lg font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Table Container */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-gray-700/50 bg-gray-800/50">
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Image</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Name</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Number</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Product</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Price</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Qty</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Size</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Color</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Category</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Date</th>
                      <th className="p-4 lg:p-6 text-left text-gray-300 font-semibold text-sm lg:text-base">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Use filteredConsumers here */}
                    {filteredConsumers.length > 0 ? (
                      filteredConsumers.map((item, index) => (
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
                                className="w-14 h-14 lg:w-16 lg:h-16 object-cover rounded-xl border border-gray-600/50 group-hover:border-cyan-500/30 transition-colors duration-300"
                              />
                            ) : (
                              <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-700/50 rounded-xl border border-gray-600/50 flex items-center justify-center group-hover:border-cyan-500/30 transition-colors duration-300">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 lg:p-6 font-medium">{item.Name || "-"}</td>
                          <td className="p-4 lg:p-6 font-mono">{item.Number || "-"}</td>
                          <td className="p-4 lg:p-6 max-w-[150px] truncate" title={item.title}>{item.title || "-"}</td>
                          <td className="p-4 lg:p-6 text-cyan-400 font-bold">₹{item.price ?? "-"}</td>
                          <td className="p-4 lg:p-6">
                            <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-medium">
                              {item.quantity ?? "-"}
                            </span>
                          </td>
                          <td className="p-4 lg:p-6">
                            {Array.isArray(item.size) ? (
                              <div className="flex flex-wrap gap-1 max-w-[120px]">
                                {item.size.map((s, i) => (
                                  <span key={i} className="bg-gray-700/30 px-2 py-1 rounded text-xs border border-gray-600/50">{s}</span>
                                ))}
                              </div>
                            ) : "-"}
                          </td>
                          <td className="p-4 lg:p-6">
                            {Array.isArray(item.colors) ? (
                              <div className="flex flex-wrap gap-1 max-w-[120px]">
                                {item.colors.map((c, i) => (
                                  <span key={i} className="bg-gray-700/30 px-2 py-1 rounded text-xs border border-gray-600/50">{c}</span>
                                ))}
                              </div>
                            ) : "-"}
                          </td>
                          <td className="p-4 lg:p-6">
                            <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full text-sm">
                              {item.category || "-"}
                            </span>
                          </td>
                          <td className="p-4 lg:p-6 text-sm text-gray-300">
                            {item.date ? new Date(item.date).toLocaleDateString('en-IN') : "-"}
                          </td>
                          <td className="p-4 lg:p-6">
                            <button
                              onClick={() => startReturnConfirmation(item)}
                              disabled={returningId === item._id}
                              className={`px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl font-medium transition-all duration-300 ${
                                returningId === item._id
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                  : "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transform hover:-translate-y-0.5"
                              }`}
                            >
                              {returningId === item._id ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Processing...
                                </div>
                              ) : (
                                "Process Return"
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="p-12 text-center">
                          <div className="max-w-md mx-auto">
                            <span className="text-7xl mb-6 block">🔎</span>
                            <h3 className="text-2xl font-bold text-gray-300 mb-3">
                                {searchTerm ? "No Matching Purchases Found" : "No Purchases Found"}
                            </h3>
                            <p className="text-gray-400 text-lg">
                                {searchTerm 
                                    ? `Could not find any purchase matching "${searchTerm}" on this page.`
                                    : "There are no purchase records available for the selected page."
                                }
                            </p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-4 px-6 py-3 rounded-xl bg-gray-700/50 border border-gray-600 text-cyan-400 hover:bg-gray-600/50 transition-all duration-300 font-medium"
                                >
                                    Clear Search
                                </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6">
                <div className="text-gray-400 text-sm">
                  Showing page {page} of {totalPages} • {consumers.length} total items
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
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/25"
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
            {/* Note: Pagination is hidden when searching, as the filtered list is a subset of the current page. */}
          </div>
        )}
      </div>
    </main>
  );
}