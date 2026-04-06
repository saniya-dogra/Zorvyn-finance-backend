const mongoose = require("mongoose");

// this schema stores all financial entries (income or expense)
const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // examples: salary, food, rent, freelance, utilities etc
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    // track who created each record createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, }, // soft delete — records are never truly deleted isDeleted: { type: Boolean, default: false, }, }, { timestamps: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
