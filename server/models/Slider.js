const mongoose = require("mongoose");

const SliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  badge: {
    type: String,
    default: "Featured",
  },
  imageUrl: {
    type: String,
    required: true,
  },
  public_id: {
    type: String, // Cloudinary public_id for deletion
  },
  statLeft: {
    type: String,
    default: "50,000+ students",
  },
  statMid: {
    type: String,
    default: "4.8 rating",
  },
  statRight: {
    type: String,
    default: "Self-paced",
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
SliderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Slider", SliderSchema);
