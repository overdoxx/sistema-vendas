const mongoose = require("mongoose")

const saleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    commission: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: ["individual", "daily_summary"],
      default: "individual",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Sale", saleSchema)
