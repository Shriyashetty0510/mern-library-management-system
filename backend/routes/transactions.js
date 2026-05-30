const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const Member = require("../models/Member");

// GET /api/transactions
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const txns = await Transaction.find(query)
      .populate("book", "title author isbn genre")
      .populate("member", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: txns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/transactions/issue  — issue a book
router.post("/issue", async (req, res) => {
  try {
    const { bookId, memberId } = req.body;

    const book = await Book.findById(bookId);
    const member = await Member.findById(memberId);

    if (!book) return res.status(404).json({ success: false, message: "Book not found" });
    if (!member) return res.status(404).json({ success: false, message: "Member not found" });
    if (member.status !== "active")
      return res.status(400).json({ success: false, message: "Member account is inactive" });
    if (book.available < 1)
      return res.status(400).json({ success: false, message: "No copies available right now" });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const txn = await Transaction.create({
      book: bookId,
      member: memberId,
      dueDate,
      status: "active",
    });

    book.available -= 1;
    await book.save();

    const populated = await Transaction.findById(txn._id)
      .populate("book", "title author isbn genre")
      .populate("member", "name email phone");

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/transactions/return/:id  — return a book
router.put("/return/:id", async (req, res) => {
  try {
    const txn = await Transaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });
    if (txn.status === "returned")
      return res.status(400).json({ success: false, message: "Book already returned" });

    txn.returnDate = new Date();
    txn.status = "returned";
    txn.calculateFine();
    await txn.save();

    await Book.findByIdAndUpdate(txn.book, { $inc: { available: 1 } });

    const populated = await Transaction.findById(txn._id)
      .populate("book", "title author isbn")
      .populate("member", "name email");

    res.json({ success: true, data: populated, fine: txn.fine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/transactions/stats/summary  — dashboard numbers
router.get("/stats/summary", async (req, res) => {
  try {
    const [bookStats, totalMembers, activeLoans, overdueLoans, returnedLoans] = await Promise.all([
      Book.aggregate([
        { $group: { _id: null, totalBooks: { $sum: "$copies" }, available: { $sum: "$available" } } },
      ]),
      Member.countDocuments({ status: "active" }),
      Transaction.countDocuments({ status: "active" }),
      Transaction.countDocuments({ status: "overdue" }),
      Transaction.countDocuments({ status: "returned" }),
    ]);

    const genreData = await Book.aggregate([
      { $group: { _id: "$genre", count: { $sum: "$copies" } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalBooks: bookStats[0]?.totalBooks || 0,
        available: bookStats[0]?.available || 0,
        totalMembers,
        activeLoans,
        overdueLoans,
        returnedLoans,
        genreData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
