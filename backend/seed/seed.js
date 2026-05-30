const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const Book = require("../models/Book");
const Member = require("../models/Member");
const Transaction = require("../models/Transaction");

const books = [
  { title: "The Name of the Wind", author: "Patrick Rothfuss", isbn: "978-0756404741", genre: "Fantasy", year: 2007, copies: 3, available: 2, description: "A fantasy novel about the life of Kvothe." },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", genre: "History", year: 2011, copies: 4, available: 4, description: "A brief history of humankind." },
  { title: "Dune", author: "Frank Herbert", isbn: "978-0441013593", genre: "Science", year: 1965, copies: 2, available: 1, description: "Epic science fiction set on desert planet Arrakis." },
  { title: "Atomic Habits", author: "James Clear", isbn: "978-0735211292", genre: "Self-Help", year: 2018, copies: 5, available: 3, description: "How tiny changes lead to remarkable results." },
  { title: "The Pragmatic Programmer", author: "David Thomas", isbn: "978-0135957059", genre: "Technology", year: 1999, copies: 2, available: 2, description: "Classic software development guide." },
  { title: "Crime and Punishment", author: "Fyodor Dostoevsky", isbn: "978-0143107637", genre: "Fiction", year: 1866, copies: 3, available: 3, description: "Psychological thriller about a student murderer." },
  { title: "Deep Work", author: "Cal Newport", isbn: "978-1455586691", genre: "Self-Help", year: 2016, copies: 2, available: 2, description: "Rules for focused success in a distracted world." },
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "978-0062315007", genre: "Fiction", year: 1988, copies: 4, available: 4, description: "A philosophical novel about following your dreams." },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", genre: "Technology", year: 2008, copies: 3, available: 3, description: "A handbook of agile software craftsmanship." },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "978-0374533557", genre: "Philosophy", year: 2011, copies: 2, available: 2, description: "How two systems drive the way we think." },
];

const members = [
  { name: "Arjun Sharma", email: "arjun@example.com", phone: "9876543210", address: "Bangalore, Karnataka", status: "active" },
  { name: "Priya Patel", email: "priya@example.com", phone: "9876543211", address: "Mumbai, Maharashtra", status: "active" },
  { name: "Rohan Mehta", email: "rohan@example.com", phone: "9876543212", address: "Pune, Maharashtra", status: "active" },
  { name: "Neha Singh", email: "neha@example.com", phone: "9876543213", address: "Delhi, India", status: "inactive" },
  { name: "Karan Gupta", email: "karan@example.com", phone: "9876543214", address: "Hyderabad, Telangana", status: "active" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/library-ms");
    console.log("Connected to MongoDB");

    // Clear existing
    await Book.deleteMany({});
    await Member.deleteMany({});
    await Transaction.deleteMany({});
    console.log("Cleared existing data");

    // Insert books and members
    const insertedBooks = await Book.insertMany(books);
    const insertedMembers = await Member.insertMany(members);
    console.log(`Inserted ${insertedBooks.length} books`);
    console.log(`Inserted ${insertedMembers.length} members`);

    // Create a few sample transactions
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 20);
    const futureDue = new Date();
    futureDue.setDate(futureDue.getDate() + 10);

    await Transaction.create([
      {
        book: insertedBooks[0]._id,
        member: insertedMembers[0]._id,
        issueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        dueDate: pastDue,
        status: "overdue",
      },
      {
        book: insertedBooks[2]._id,
        member: insertedMembers[1]._id,
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dueDate: futureDue,
        status: "active",
      },
      {
        book: insertedBooks[3]._id,
        member: insertedMembers[2]._id,
        issueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: "returned",
        fine: 0,
      },
    ]);
    console.log("Inserted sample transactions");

    console.log("\n✅ Seed complete! Your database is ready.\n");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
