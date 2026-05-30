const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "returned", "overdue"],
      default: "active",
    },
    fine: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Fine = Rs.5 per overdue day
transactionSchema.methods.calculateFine = function () {
  if (this.returnDate && this.returnDate > this.dueDate) {
    const days = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
    this.fine = days * 5;
  } else {
    this.fine = 0;
  }
};

module.exports = mongoose.model("Transaction", transactionSchema);
