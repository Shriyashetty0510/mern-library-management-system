const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
      enum: [
        "Fiction",
        "Non-Fiction",
        "Science",
        "History",
        "Biography",
        "Philosophy",
        "Technology",
        "Mystery",
        "Fantasy",
        "Self-Help",
      ],
      default: "Fiction",
    },
    year: {
      type: Number,
      min: 1000,
      max: new Date().getFullYear(),
    },
    copies: {
      type: Number,
      required: true,
      min: [1, "At least 1 copy required"],
      default: 1,
    },
    available: {
      type: Number,
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

// Before saving, if available is not set, make it equal to copies
bookSchema.pre("save", function (next) {
  if (this.isNew && this.available === undefined) {
    this.available = this.copies;
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);
