# 📚 Biblios — Library Management System

A full-stack Library Management System built with **React**, **Node.js**, **Express**, and **MongoDB**.

![Stack](https://img.shields.io/badge/React-18-blue?logo=react) ![Stack](https://img.shields.io/badge/Node.js-Express-green?logo=node.js) ![Stack](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?logo=mongodb)

---

## Features

- **Dashboard** — live stats, recent transactions, genre distribution chart
- **Books** — add, edit, delete books, search by title/author/ISBN, filter by genre
- **Members** — register members, activate/deactivate, full CRUD
- **Transactions** — issue books, return books, auto fine calculation (₹5/day overdue)
- Real-time search with debounce
- Toast notifications on every action
- Fully connected to MongoDB — all data persists

---

## Project Structure

```
library-ms/
├── backend/
│   ├── config/       → MongoDB connection
│   ├── models/       → Mongoose schemas (Book, Member, Transaction)
│   ├── routes/       → Express API routes
│   ├── seed/         → Demo data seeder
│   ├── server.js     → Entry point
│   └── .env          → Environment variables
└── frontend/
    ├── public/
    └── src/
        ├── components/   → Sidebar, Modal, Toast
        ├── pages/        → Dashboard, Books, Members, Transactions
        ├── utils/        → Axios API helper
        ├── App.js
        └── index.css
```

---

## How to Run Locally

### Prerequisites
- Node.js v18+ installed → https://nodejs.org
- MongoDB running locally → https://www.mongodb.com/try/download/community
  - After installing, start MongoDB:
    - **Mac/Linux:** `mongod` or `brew services start mongodb-community`
    - **Windows:** MongoDB runs as a service after install

---

### Step 1 — Clone / Download

```bash
git clone https://github.com/YOUR_USERNAME/library-ms.git
cd library-ms
```

---

### Step 2 — Setup & Run the Backend

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ MongoDB connected: localhost
🚀 Server running on http://localhost:5000
```

---

### Step 3 — Seed the Database (optional but recommended)

Open a new terminal tab:

```bash
cd backend
node seed/seed.js
```

This adds 10 books, 5 members, and 3 sample transactions so you have data to see right away.

---

### Step 4 — Setup & Run the Frontend

Open another terminal tab:

```bash
cd frontend
npm install
npm start
```

The React app opens at **http://localhost:3000**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books` | Get all books (supports ?search= and ?genre=) |
| POST | `/api/books` | Add a new book |
| PUT | `/api/books/:id` | Edit a book |
| DELETE | `/api/books/:id` | Delete a book |
| GET | `/api/members` | Get all members |
| POST | `/api/members` | Register a member |
| PUT | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions/issue` | Issue a book |
| PUT | `/api/transactions/return/:id` | Return a book |
| GET | `/api/transactions/stats/summary` | Dashboard stats |

---

## Pushing to GitHub

```bash
# From the root library-ms folder
git init
git add .
git commit -m "feat: full-stack library management system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/library-ms.git
git push -u origin main
```

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router, Axios |
| Styling | Pure CSS with CSS variables (no framework) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Dev tools | Nodemon, React Scripts |

---

## Author

Built by [Your Name] — feel free to fork and extend!
