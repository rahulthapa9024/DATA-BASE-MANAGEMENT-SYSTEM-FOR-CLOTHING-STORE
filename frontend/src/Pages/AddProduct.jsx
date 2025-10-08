import React, { useState } from "react";
import axiosClient from "../utils/axiosClient";
import { motion, AnimatePresence } from "framer-motion";

export default function AddProduct() {
  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    size: [],
    colors: [],
    image: [],
    inStock: true,
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, checked } = e.target;

    if (["size", "colors", "image"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value.split(",").map((item) => item.trim()),
      }));
    } else if (name === "inStock") {
      setForm((prev) => ({ ...prev, inStock: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setError("");
    setSuccessMessage("");
  }

  const toggleInStock = () => {
    setForm((prev) => ({ ...prev, inStock: !prev.inStock }));
    setError("");
    setSuccessMessage("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      };
      const { data } = await axiosClient.post("/main/addProducts", payload);
      if (data.product) {
        setSuccessMessage(data.message || "Product added successfully!");
        setForm({
          title: "",
          category: "",
          price: "",
          size: [],
          colors: [],
          image: [],
          inStock: true,
          quantity: "",
        });
      } else {
        setError(data.message || "Failed to add product.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error adding product.");
    } finally {
      setLoading(false);
    }
  }

  const inputClasses =
    "w-full px-5 py-3 rounded-2xl border border-gray-700 bg-gray-900/60 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/60 focus:border-transparent shadow-md transition-all duration-300";

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 sm:p-12">
      <div className="max-w-lg w-full bg-gray-800/60 backdrop-blur-lg rounded-3xl p-10 border border-gray-700/60 shadow-lg shadow-cyan-700/20">
        <h1 className="text-4xl font-extrabold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent select-none">
          Add New Product
        </h1>
        <p className="text-gray-400 mb-8 text-center tracking-wide">
          Fill in the details below to create a new product
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-gray-300 font-semibold block text-lg">
              Product Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={form.title}
              onChange={handleChange}
              placeholder="Enter product title"
              className={inputClasses}
              spellCheck={false}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-gray-300 font-semibold block text-lg">
              Category
            </label>
            <select
              name="category"
              required
              value={form.category}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="" disabled>
                Select category...
              </option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <label className="text-gray-300 font-semibold block text-lg">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClasses}
              />
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-gray-300 font-semibold block text-lg">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="1"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0"
                className={inputClasses}
              />
            </div>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <label className="text-gray-300 font-semibold block text-lg">
              Sizes{" "}
              <span className="text-gray-400 text-sm">(Comma separated)</span>
            </label>
            <input
              type="text"
              name="size"
              required
              placeholder="S, M, L, XL"
              value={form.size.join(", ")}
              onChange={handleChange}
              className={inputClasses}
              spellCheck={false}
            />
            <p className="text-gray-400 text-xs italic tracking-wide mt-1">
              Example: S, M, L, XL, XXL
            </p>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <label className="text-gray-300 font-semibold block text-lg">
              Colors{" "}
              <span className="text-gray-400 text-sm">(Comma separated)</span>
            </label>
            <input
              type="text"
              name="colors"
              required
              placeholder="Red, Blue, Black"
              value={form.colors.join(", ")}
              onChange={handleChange}
              className={inputClasses}
              spellCheck={false}
            />
            <p className="text-gray-400 text-xs italic tracking-wide mt-1">
              Example: Red, Blue, Black, White
            </p>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <label className="text-gray-300 font-semibold block text-lg">
              Image URLs{" "}
              <span className="text-gray-400 text-sm">(Comma separated)</span>
            </label>
            <textarea
              name="image"
              required
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              value={form.image.join(", ")}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-gray-700 bg-gray-900/60 text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/60 focus:border-transparent shadow-md transition-all duration-300 resize-none max-h-28"
              spellCheck={false}
            />
            <p className="text-gray-400 text-xs italic tracking-wide mt-1">
              Enter full image URLs separated by commas
            </p>
          </div>

          {/* Toggle In Stock */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-700 bg-gray-900/40 shadow-inner shadow-cyan-700/10">
            <div>
              <label className="text-gray-300 font-semibold block text-lg select-none cursor-default">
                Stock Status
              </label>
              <p
                className={`text-sm mt-1 flex items-center gap-2 ${
                  form.inStock ? "text-green-400" : "text-red-400"
                } font-medium select-none`}
              >
                <span
                  className={`inline-block w-3 h-3 rounded-full ${
                    form.inStock ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                {form.inStock
                  ? "Product will be available for purchase"
                  : "Product will be out of stock"}
              </p>
            </div>
            <button
              type="button"
              aria-label={form.inStock ? "Set out of stock" : "Set in stock"}
              onClick={toggleInStock}
              className={`relative inline-flex h-9 w-18 items-center rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400 ${
                form.inStock ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <span
                className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md shadow-black/20 transition-transform duration-300 ease-in-out ${
                  form.inStock ? "translate-x-9" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all duration-300 ${
              !loading
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-cyan-600/40 hover:shadow-cyan-600/60 transform hover:-translate-y-1"
                : "bg-gray-700 cursor-not-allowed text-gray-400"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding Product...
              </div>
            ) : (
              "Add Product"
            )}
          </button>
        </form>

        {/* Success / Error */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="mt-8 p-4 rounded-2xl bg-green-600/20 border border-green-600/40 text-green-400 text-center font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              role="alert"
            >
              {successMessage}
            </motion.div>
          )}
          {error && (
            <motion.div
              className="mt-8 p-4 rounded-2xl bg-red-600/20 border border-red-600/40 text-red-400 text-center font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
