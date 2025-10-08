const mongoose = require('mongoose');
const returnSchema = new mongoose.Schema({
    Name:{
        type:String,
        required: true,
    },
    Number:{
      type:Number,
      required: true
    },
    title: {
        type: String,
        required: true,
      },
    
      category: {
        type: String,
        required: true,
        trim: true,
        enum:["men","women","both"]
      },
      price: {
        type: Number,
        required: true,
      },
      quantity:{
        type: Number,
        required: true,
      },
      size: {
        type: [String],
        required: true,
        enum:["S","M","L","XL","XXL","XXXL"]
      },
      colors: {
        type: [String],
        required: true,
      },
      image: {
        type: [String],
        required: true,
      },
      date:{
        type:Date
      }
})

const ReturnSchema = mongoose.model("Return",returnSchema)
 
module.exports = ReturnSchema;