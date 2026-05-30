const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// GET /api/books
router.get("/", async (req, res) => {
  try {
    const { search, genre } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } },
      ];
    }
    if (genre && genre !== "All") query.genre = genre;

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/books/:id
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/books
router.post("/", async (req, res) => {
  try {
    const { title, author, isbn, genre, year, copies, description } = req.body;
    const copiesNum = parseInt(copies) || 1;
    const book = await Book.create({
      title,
      author,
      isbn,
      genre,
      year: parseInt(year) || new Date().getFullYear(),
      copies: copiesNum,
      available: copiesNum,
      description,
    });
    res.status(201).json({ success: true, data: book });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "A book with this ISBN already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/books/:id
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, data: book });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    res.json({ success: true, message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
