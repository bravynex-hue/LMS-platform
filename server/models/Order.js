const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  // userName: String, // Remove this, as it will be populated from User model
  // userEmail: String, // Remove this, as it will be populated from User model
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  orderDate: Date,
  paymentId: String,
  payerId: String,
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming instructorId also references the User model
    required: true,
  },
  instructorName: String,
  courseImage: String,
  courseTitle: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Reference to the Course model
    required: true,
  },
  coursePricing: Number, // Changed from String to Number
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
