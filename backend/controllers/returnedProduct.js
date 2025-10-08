const Consumer = require("../models/comsumeProductSchema");
const Return = require("../models/returnedSchema");


// POST /api/returnProduct
// Expects request body to include an identifier to find the consumer record, e.g. consumer ID or Number + title
async function createReturnFromConsumer(req, res) {
  try {
    // Example: use consumer ID from body, adapt as needed
    const { consumerId } = req.body;
    if (!consumerId) {
      return res.status(400).json({ success: false, message: "consumerId is required" });
    }


    // Find consumer document by ID
    const consumerDoc = await Consumer.findById(consumerId);
    if (!consumerDoc) {
      return res.status(404).json({ success: false, message: "Consumer record not found" });
    }


    // Create new Return document, copying consumer fields except date (use current date)
    const returnDoc = new Return({
      Name: consumerDoc.Name,
      Number: consumerDoc.Number,
      title: consumerDoc.title,
      category: consumerDoc.category,
      price: consumerDoc.price,
      quantity: consumerDoc.quantity,
      size: consumerDoc.size,
      colors: consumerDoc.colors,
      image: consumerDoc.image,
      date: new Date(), // current date for return
    });


    // Save Return document
    await returnDoc.save();

    await Consumer.findByIdAndDelete(consumerId);
    res.json({ success: true, message: "Return record created", return: returnDoc });
  } catch (err) {
    console.error("Error creating return record:", err);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
}


module.exports =  createReturnFromConsumer ;
