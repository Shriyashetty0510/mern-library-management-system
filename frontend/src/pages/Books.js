import React, { useEffect, useState, useCallback } from "react";
import { booksAPI } from "../utils/api";
import Modal from "../components/Modal";

const GENRES = ["Fiction","Non-Fiction","Science","History","Biography","Philosophy","Technology","Mystery","Fantasy","Self-Help"];

const COVER_COLORS = [
  "linear-gradient(135deg,#1a1a2e,#16213e)",
  "linear-gradient(135deg,#1a1a12,#1f2a10)",
  "linear-gradient(135deg,#1f1a10,#2a1f0a)",
  "linear-gradient(135deg,#1a1018,#2a1020)",
  "linear-gradient(135deg,#101a1f,#102030)",
  "linear-gradient(135deg,#1a1218,#2a1a28)",
];

function coverColor(title) {
  let h = 0;
  for (let i = 0; i < (title?.length || 0); i++) h += title.charCodeAt(i);
  return COVER_COLORS[h % COVER_COLORS.length];
}

export default function Books({ toast }) {
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [genre, setGenre]     = useState("");
  const [modal, setModal]     = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm]       = useState({});
  const [errors, setErrors]   = useState({});
  const [submitting, setSub]  = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await booksAPI.getAll({ search, genre });
      setBooks(res.data.data);
    } catch {
      toast("Failed to load books", "error");
    } finally {
      setLoading(false);
    }
  }, [search, genre]);

  useEffect(() => {
    const delay = setTimeout(fetchBooks, 300);
    return () => clearTimeout(delay);
  }, [fetchBooks]);

  const openAdd = () => {
    setEditBook(null);
    setForm({ genre: "Fiction", copies: "1", year: String(new Date().getFullYear()) });
    setErrors({});
    setModal(true);
  };

  const openEdit = (b) => {
    setEditBook(b);
    setForm({ title: b.title, author: b.author, isbn: b.isbn, genre: b.genre, year: String(b.year), copies: String(b.copies), description: b.description || "" });
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.title?.trim())  e.title  = "Title is required";
    if (!form.author?.trim()) e.author = "Author is required";
    if (!form.isbn?.trim())   e.isbn   = "ISBN is required";
    if (!form.copies || isNaN(form.copies) || Number(form.copies) < 1) e.copies = "Enter a valid number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSub(true);
    try {
      if (editBook) {
        await booksAPI.update(editBook._id, form);
        toast("Book updated successfully");
      } else {
        await booksAPI.create(form);
        toast("Book added to the library");
      }
      setModal(false);
      fetchBooks();
    } catch (err) {
      toast(err.response?.data?.message || "Something went wrong", "error");
    } finally {
      setSub(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this book from the library?")) return;
    try {
      await booksAPI.delete(id);
      toast("Book removed");
      fetchBooks();
    } catch (err) {
      toast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="page-enter">
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, author, or ISBN…" />
        </div>
        <select className="filter-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">All Genres</option>
          {GENRES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Book</button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📚</span>
          <p>No books found. Add your first book!</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((b) => (
            <div className="book-card" key={b._id}>
              <div className="book-cover" style={{ background: coverColor(b.title) }}>📖</div>
              <div className="book-info">
                <div className="book-title">{b.title}</div>
                <div className="book-author">{b.author} · {b.year}</div>
                <div className="book-meta">
                  <span className="badge badge-amber">{b.genre}</span>
                  <span className="book-avail" style={{ color: b.available > 0 ? "var(--green)" : "var(--red)" }}>
                    {b.available}/{b.copies}
                  </span>
                </div>
                <div className="book-isbn">{b.isbn}</div>
                {b.description && (
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, lineHeight: 1.5 }}>
                    {b.description.slice(0, 80)}{b.description.length > 80 ? "…" : ""}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(b)}>Edit</button>
                  <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(b._id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={editBook ? "Edit Book" : "Add New Book"} onClose={() => setModal(false)}>
          <div className="form-row">
            <label className="form-label">Title *</label>
            <input value={form.title || ""} onChange={f("title")} placeholder="e.g. The Great Gatsby" />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>
          <div className="form-row">
            <label className="form-label">Author *</label>
            <input value={form.author || ""} onChange={f("author")} placeholder="e.g. F. Scott Fitzgerald" />
            {errors.author && <span className="form-error">{errors.author}</span>}
          </div>
          <div className="form-row">
            <label className="form-label">ISBN *</label>
            <input value={form.isbn || ""} onChange={f("isbn")} placeholder="978-XXXXXXXXXX" />
            {errors.isbn && <span className="form-error">{errors.isbn}</span>}
          </div>
          <div className="form-grid">
            <div className="form-row">
              <label className="form-label">Genre</label>
              <select value={form.genre || "Fiction"} onChange={f("genre")}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label className="form-label">Publication Year</label>
              <input type="number" value={form.year || ""} onChange={f("year")} placeholder="2024" />
            </div>
          </div>
          <div className="form-row">
            <label className="form-label">Number of Copies *</label>
            <input type="number" min="1" value={form.copies || ""} onChange={f("copies")} placeholder="1" />
            {errors.copies && <span className="form-error">{errors.copies}</span>}
          </div>
          <div className="form-row">
            <label className="form-label">Description (optional)</label>
            <textarea rows={3} value={form.description || ""} onChange={f("description")} placeholder="Brief description of the book…" />
          </div>
          <button className="form-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving…" : editBook ? "Update Book" : "Add to Library"}
          </button>
        </Modal>
      )}
    </div>
  );
}
