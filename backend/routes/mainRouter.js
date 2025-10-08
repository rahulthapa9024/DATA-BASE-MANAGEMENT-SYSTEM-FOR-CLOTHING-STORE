const express = require('express');
const mainRouter = express.Router();

const addProducts = require("../controllers/addProduct");
const updateProduct = require("../controllers/updateProduct");
const getAllProducts = require("../controllers/getAllProducts");
const getProductById = require("../controllers/getProductbyId");
const purchaseProduct = require("../controllers/purchaseRegister")
const getAllPurchases = require("../controllers/getHistory")
const deleteProductByTitle = require("../controllers/deleteProduct")
const returnProduct = require("../controllers/returnedProduct")
const getReturnProducts = require("../controllers/getReturnProducts")
// Route to add products
mainRouter.post("/addProducts", addProducts);

// Route to update a product by ID
mainRouter.patch("/updateProducts/:id", updateProduct);

// Route to get all products
mainRouter.get("/getProducts", getAllProducts);

// Route to get a product by ID
mainRouter.get("/getProductById/:id", getProductById);

mainRouter.post("/purchaseProduct",purchaseProduct)

mainRouter.get("/getHistory",getAllPurchases)

mainRouter.delete("/deleteProduct",deleteProductByTitle)

mainRouter.post("/productReturned",returnProduct)

mainRouter.get("/getReturnProducts",getReturnProducts)

module.exports = mainRouter;
