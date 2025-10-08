import React, { useState, useEffect } from "react";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPER ICONS ---
const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
  </svg>
);

const TrashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ExclamationIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const WarningTriangleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
// --- END HELPER ICONS ---

export default function RemoveProduct() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductTitle, setSelectedProductTitle] = useState("");
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModalState, setResultModalState] = useState({ isOpen: false, status: "", message: "" });

  // Fetch products from API
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await axiosClient.get("/main/getProducts");
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenConfirmModal = (e) => {
    e.preventDefault();
    if (selectedProductTitle) {
      setConfirmModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedProductTitle) return;
    setIsSubmitting(true);
    try {
      const { data } = await axiosClient.delete("/main/deleteProduct", { data: { title: selectedProductTitle } });
      if (data.success) {
        setResultModalState({
          isOpen: true,
          status: "success",
          message: `Product "${selectedProductTitle}" has been permanently deleted.`,
        });
      } else {
        setResultModalState({
          isOpen: true,
          status: "error",
          message: data.message || "Failed to delete product.",
        });
      }
    } catch (err) {
      setResultModalState({
        isOpen: true,
        status: "error",
        message: err.response?.data?.message || "Error deleting product.",
      });
    } finally {
      setIsSubmitting(false);
      setConfirmModalOpen(false);
    }
  };

  const handleCloseResultModal = () => {
    if (resultModalState.status === "success") {
      setSelectedProductTitle("");
      fetchProducts();
    }
    setResultModalState({ isOpen: false, status: "", message: "" });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 mb-4 shadow-lg shadow-red-500/20">
              <TrashIcon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Remove Product
            </h2>
            <p className="text-gray-400 text-sm">
              Select a product to permanently delete it from the database
            </p>
          </div>

          <form onSubmit={handleOpenConfirmModal} className="space-y-6">
            {/* Product Selection */}
            <div className="space-y-2">
              <label htmlFor="product-select" className="block text-sm font-medium text-gray-300">
                Select Product to Delete
              </label>
              <div className="relative">
                <select
                  id="product-select"
                  value={selectedProductTitle}
                  onChange={(e) => setSelectedProductTitle(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-900/60 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none cursor-pointer hover:bg-gray-900/80"
                  disabled={loadingProducts}
                >
                  <option value="">
                    {loadingProducts ? "Loading products..." : "Choose a product..."}
                  </option>
                  {products.map((p) => (
                    <option key={p._id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedProductTitle && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-amber-400 flex items-center gap-2 mt-2"
                >
                  <WarningTriangleIcon className="w-4 h-4" />
                  This action cannot be undone
                </motion.p>
              )}
            </div>

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: selectedProductTitle ? 1.02 : 1 }}
              whileTap={{ scale: selectedProductTitle ? 0.98 : 1 }}
              type="submit"
              disabled={!selectedProductTitle}
              className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/20 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <TrashIcon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">DELETE PRODUCT</span>
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModalOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-8 text-center shadow-2xl shadow-black/50 relative z-10"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <ExclamationIcon className="w-10 h-10 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">Confirm Deletion</h3>
              <p className="text-gray-300 mb-2">
                You are about to delete:
              </p>
              <p className="text-lg font-semibold text-white bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4 mb-4">
                "{selectedProductTitle}"
              </p>
              <p className="text-sm text-amber-400 mb-6">
                This action cannot be undone and will permanently remove the product.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-semibold bg-gray-700/50 hover:bg-gray-700/80 text-white transition-colors border border-gray-600/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <SpinnerIcon /> : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Result Modal */}
        {resultModalState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleCloseResultModal}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-8 text-center shadow-2xl shadow-black/50 relative z-10"
            >
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
                resultModalState.status === "success" 
                  ? "bg-green-500/10" 
                  : "bg-red-500/10"
              }`}>
                {resultModalState.status === "success" ? (
                  <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <ExclamationIcon className="w-10 h-10 text-red-400" />
                )}
              </div>

              <h3 className={`text-2xl font-bold mb-4 ${
                resultModalState.status === "success" ? "text-green-400" : "text-red-400"
              }`}>
                {resultModalState.status === "success" ? "Deletion Successful" : "Deletion Failed"}
              </h3>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                {resultModalState.message}
              </p>

              <button
                onClick={handleCloseResultModal}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all ${
                  resultModalState.status === "success" 
                    ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20" 
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/20"
                }`}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}